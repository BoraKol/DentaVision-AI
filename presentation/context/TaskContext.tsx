import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth, User } from './AuthContext';
import { useToast } from './ToastContext';

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'Todo' | 'Doing' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    assignee?: any;
    creator: any;
    dueDate?: string;
    completedAt?: string;
    createdAt: string;
}

interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    fetchTasks: () => Promise<void>;
    createTask: (taskData: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const { token, user } = useAuth();
    const { addToast } = useToast();

    const getApiUrl = () => {
        const baseUrl = (import.meta as any).env.VITE_API_URL || '';
        return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
    };

    const fetchTasks = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-branch': (user as User)?.activeBranch || 'Main Branch'
                }
            };
            const res = await axios.get(`${getApiUrl()}/tasks`, config);
            if (res.data.success) {
                setTasks(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            addToast('Görevler yüklenirken hata oluştu', 'error');
        } finally {
            setLoading(false);
        }
    }, [token, user, addToast]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const createTask = async (taskData: Partial<Task>) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-branch': (user as User)?.activeBranch || 'Main Branch'
                }
            };
            const res = await axios.post(`${getApiUrl()}/tasks`, taskData, config);
            if (res.data.success) {
                setTasks(prev => [...prev, res.data.data]);
                addToast('Görev başarıyla eklendi', 'success');
            }
        } catch (error) {
            addToast('Görev eklenirken hata oluştu', 'error');
        }
    };

    const updateTask = async (taskId: string, taskData: Partial<Task>) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-branch': (user as User)?.activeBranch || 'Main Branch'
                }
            };
            const res = await axios.put(`${getApiUrl()}/tasks/${taskId}`, taskData, config);
            if (res.data.success) {
                setTasks(prev => prev.map(task => task._id === taskId ? res.data.data : task));
                if (!taskData.status) {
                    addToast('Görev güncellendi', 'success');
                }
            }
        } catch (error) {
            addToast('Görev güncellenirken hata oluştu', 'error');
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-branch': (user as User)?.activeBranch || 'Main Branch'
                }
            };
            const res = await axios.delete(`${getApiUrl()}/tasks/${taskId}`, config);
            if (res.data.success) {
                setTasks(prev => prev.filter(task => task._id !== taskId));
                addToast('Görev silindi', 'success');
            }
        } catch (error) {
            addToast('Görev silinirken hata oluştu', 'error');
        }
    };

    return (
        <TaskContext.Provider value={{ tasks, loading, fetchTasks, createTask, updateTask, deleteTask }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
