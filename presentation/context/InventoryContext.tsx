import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';

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
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const { addToast } = useToast();

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/inventory');
            if (res.data.success) {
                setItems(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            addToast('Stok listesi alınamadı', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (itemData: Omit<InventoryItem, '_id' | 'lastRestocked'>) => {
        try {
            const res = await axios.post('http://localhost:3000/api/inventory', itemData);
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
            const res = await axios.put(`http://localhost:3000/api/inventory/${id}`, itemData);
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
            const res = await axios.delete(`http://localhost:3000/api/inventory/${id}`);
            if (res.data.success) {
                setItems(items.filter(item => item._id !== id));
                addToast('Ürün silindi', 'success');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            addToast('Ürün silinirken hata oluştu', 'error');
        }
    };

    useEffect(() => {
        if (user) {
            fetchItems();
        }
    }, [user]);

    return (
        <InventoryContext.Provider value={{ items, loading, fetchItems, addItem, updateItem, deleteItem }}>
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
