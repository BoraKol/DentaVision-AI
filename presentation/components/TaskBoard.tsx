import React, { useState } from 'react';
import {
    Plus,
    MoreVertical,
    Calendar,
    User as UserIcon,
    Clock,
    AlertCircle,
    CheckCircle2,
    Circle,
    Trash2
} from 'lucide-react';
import { useTasks, Task } from '../context/TaskContext';
import { useLanguage } from '../context/LanguageContext';

const TaskBoard: React.FC = () => {
    const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
    const { language } = useLanguage();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('Medium');

    const columns: { id: Task['status']; title: string; icon: any; color: string }[] = [
        {
            id: 'Todo',
            title: language === 'tr' ? 'Yapılacak' : 'To Do',
            icon: Circle,
            color: 'text-slate-400'
        },
        {
            id: 'Doing',
            title: language === 'tr' ? 'Devam Eden' : 'In Progress',
            icon: Clock,
            color: 'text-blue-500'
        },
        {
            id: 'Done',
            title: language === 'tr' ? 'Tamamlanan' : 'Completed',
            icon: CheckCircle2,
            color: 'text-emerald-500'
        }
    ];

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        await createTask({
            title: newTaskTitle,
            priority: newTaskPriority,
            status: 'Todo'
        });
        setNewTaskTitle('');
        setIsAddModalOpen(false);
    };

    const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
        updateTask(taskId, { status: newStatus });
    };

    const priorityColors = {
        Low: 'bg-blue-100 text-blue-700 border-blue-200',
        Medium: 'bg-amber-100 text-amber-700 border-amber-200',
        High: 'bg-rose-100 text-rose-700 border-rose-200'
    };

    const TaskCard = ({ task }: { task: Task }) => (
        <div className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 mb-3 relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'High' ? 'bg-rose-500' :
                    task.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />

            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => deleteTask(task._id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <h4 className="text-sm font-semibold text-slate-800 mb-3 leading-tight">
                {task.title}
            </h4>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-white shadow-sm">
                        {task.assignee?.name?.substring(0, 1) || <UserIcon className="w-3 h-3" />}
                    </div>
                    {task.dueDate && (
                        <div className="flex items-center text-[10px] text-slate-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' })}
                        </div>
                    )}
                </div>

                <select
                    value={task.status}
                    onChange={(e) => handleStatusUpdate(task._id, e.target.value as any)}
                    className="text-[10px] font-medium bg-slate-50 border-none rounded-lg focus:ring-0 cursor-pointer text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    <option value="Todo">Todo</option>
                    <option value="Doing">Doing</option>
                    <option value="Done">Done</option>
                </select>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {language === 'tr' ? 'Görev Takibi' : 'Task Tracking'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {language === 'tr' ? 'Klinik aktivitelerini ve personel görevlerini yönetin.' : 'Manage clinical activities and staff tasks.'}
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {language === 'tr' ? 'Yeni Görev' : 'New Task'}
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map(col => (
                        <div key={col.id} className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center space-x-2">
                                    <col.icon className={`w-5 h-5 ${col.color}`} />
                                    <h3 className="font-bold text-slate-700">{col.title}</h3>
                                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {tasks.filter(t => t.status === col.id).length}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 bg-slate-100/50 rounded-2xl p-3 min-h-[500px] border border-slate-200/50">
                                {tasks.filter(t => t.status === col.id).map(task => (
                                    <TaskCard key={task._id} task={task} />
                                ))}

                                {tasks.filter(t => t.status === col.id).length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-2">
                                        <Circle className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-xs">{language === 'tr' ? 'Görev yok' : 'No tasks'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Simple Inline Modal for Adding Tasks */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">{language === 'tr' ? 'Yeni Görev Ekle' : 'Add New Task'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
                        </div>
                        <form onSubmit={handleAddTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{language === 'tr' ? 'Görev Başlığı' : 'Task Title'}</label>
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder={language === 'tr' ? 'Örn: Laboratuvar takibi yapılacak' : 'e.g. Follow up on lab order'}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-teal-500 focus:ring-0 transition-all text-sm"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{language === 'tr' ? 'Öncelik' : 'Priority'}</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['Low', 'Medium', 'High'] as const).map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setNewTaskPriority(p)}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${newTaskPriority === p
                                                    ? (p === 'High' ? 'bg-rose-50 border-rose-500 text-rose-700' :
                                                        p === 'Medium' ? 'bg-amber-50 border-amber-500 text-amber-700' :
                                                            'bg-blue-50 border-blue-500 text-blue-700')
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all"
                                >
                                    {language === 'tr' ? 'Görev Oluştur' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskBoard;
