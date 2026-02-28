import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { financialsAPI } from '../../infrastructure/services/ApiService';
import { useAuth } from './AuthContext';

export interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    category: string;
    date: Date;
    description?: string;
    patientId?: string;
    treatmentId?: string;
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'INSURANCE' | 'TRANSFER';
    invoiceStatus?: 'PENDING' | 'GENERATED' | 'FAILED';
    invoiceId?: string;
    invoiceDocumentUrl?: string;
}

interface FinancialContextType {
    transactions: Transaction[];
    loading: boolean;
    fetchPatientTransactions: (patientId: string) => Promise<void>;
    addTransaction: (data: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    generateInvoice: (id: string) => Promise<void>;
    totals: {
        income: number;
        expense: number;
        balance: number;
    };
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
    const context = useContext(FinancialContext);
    if (!context) {
        throw new Error('useFinancial must be used within a FinancialProvider');
    }
    return context;
};

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchPatientTransactions = useCallback(async (patientId: string) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await financialsAPI.getAll({ patientId });
            const data = (response.data.data || []).map((t: any) => ({
                ...t,
                id: t._id,
                date: new Date(t.date)
            }));
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch patient transactions', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const addTransaction = async (data: Omit<Transaction, 'id' | 'date'>) => {
        try {
            const response = await financialsAPI.create(data);
            const newTransaction = {
                ...response.data.data,
                id: response.data.data._id,
                date: new Date(response.data.data.date)
            };
            setTransactions(prev => [newTransaction, ...prev]);
        } catch (error) {
            console.error('Failed to add transaction', error);
            throw error;
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            await financialsAPI.delete(id);
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Failed to delete transaction', error);
            throw error;
        }
    };

    const generateInvoice = async (id: string) => {
        try {
            const response = await financialsAPI.generateInvoice(id);
            const updatedTx = response.data.data;
            setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedTx, id: updatedTx._id } : t));
        } catch (error) {
            console.error('Failed to generate invoice', error);
            throw error;
        }
    };

    const totals = transactions.reduce((acc, curr) => {
        if (curr.type === 'INCOME') acc.income += curr.amount;
        else acc.expense += curr.amount;
        acc.balance = acc.income - acc.expense;
        return acc;
    }, { income: 0, expense: 0, balance: 0 });

    return (
        <FinancialContext.Provider value={{
            transactions,
            loading,
            fetchPatientTransactions,
            addTransaction,
            deleteTransaction,
            generateInvoice,
            totals
        }}>
            {children}
        </FinancialContext.Provider>
    );
};
