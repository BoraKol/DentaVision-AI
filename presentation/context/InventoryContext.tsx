import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

import { inventoryAPI } from '../../infrastructure/services/ApiService';

export interface InventoryItem {
    _id: string;
    name: string;
    category: 'Sarf Malzeme' | 'Enstrüman' | 'İmplant' | 'İlaç' | 'Diğer';
    quantity: number;
    unit: string;
    minLevel: number;
    cost: number;
    supplier?: string;
    expirationDate?: string;
    lastRestocked: string;
    notes?: string;
}

interface InventoryContextType {
    items: InventoryItem[];
    loading: boolean;
    fetchItems: () => Promise<void>;
    addItem: (item: Omit<InventoryItem, '_id' | 'lastRestocked'>) => Promise<void>;
    updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    addTransaction: (id: string, type: 'IN' | 'OUT' | 'ADJUST', amount: number, note?: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();
    const { addToast } = useToast();

    const fetchItems = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await inventoryAPI.getAll();
            if (res.data.success) {
                setItems(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            // Don't show toast if it's a 401 inside login page or during logout
            if ((error as any)?.response?.status !== 401) {
                addToast('Stok listesi alınamadı', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (itemData: Omit<InventoryItem, '_id' | 'lastRestocked'>) => {
        try {
            const res = await inventoryAPI.create(itemData);
            if (res.data.success) {
                setItems([...items, res.data.data]);
                addToast('Ürün eklendi', 'success');
            }
        } catch (error) {
            console.error('Error adding item:', error);
            addToast('Ürün eklenirken hata oluştu', 'error');
        }
    };

    const updateItem = async (id: string, itemData: Partial<InventoryItem>) => {
        try {
            const res = await inventoryAPI.update(id, itemData);
            if (res.data.success) {
                setItems(items.map(item => item._id === id ? res.data.data : item));
                addToast('Ürün güncellendi', 'success');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            addToast('Ürün güncellenirken hata oluştu', 'error');
        }
    };

    const deleteItem = async (id: string) => {
        try {
            const res = await inventoryAPI.delete(id);
            if (res.data.success) {
                setItems(items.filter(item => item._id !== id));
                addToast('Ürün silindi', 'success');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            addToast('Ürün silinirken hata oluştu', 'error');
        }
    };

    const addTransaction = async (id: string, type: 'IN' | 'OUT' | 'ADJUST', amount: number, note?: string) => {
        try {
            const res = await inventoryAPI.addTransaction(id, { type, amount, note });
            if (res.data.success) {
                setItems(items.map(item => item._id === id ? res.data.data : item));
                addToast('Stok hareketi kaydedildi', 'success');
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            addToast('Stok hareketi kaydedilemedi', 'error');
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchItems();
        } else {
            setItems([]);
        }
    }, [isAuthenticated]);

    return (
        <InventoryContext.Provider value={{ items, loading, fetchItems, addItem, updateItem, deleteItem, addTransaction }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
