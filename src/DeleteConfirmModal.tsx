import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
    title?: string;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmModal({ title = 'Confirm Deletion', message = 'Are you sure you want to delete this item? This action cannot be undone.', onConfirm, onCancel }: DeleteConfirmModalProps) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[300] flex items-center justify-center p-6 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_32px_100px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-200">
                <div className="relative p-10 flex flex-col items-center text-center">
                    <button 
                        onClick={onCancel}
                        className="absolute right-6 top-6 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
                    >
                        <X size={24} />
                    </button>

                    <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-600 flex items-center justify-center mb-8 shadow-inner">
                        <AlertTriangle size={40} strokeWidth={2.5} />
                    </div>
                    
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
                    <p className="text-slate-500 text-lg leading-relaxed mb-10 px-4">
                        {message}
                    </p>
                    
                    <div className="flex gap-4 w-full">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-8 py-4.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold rounded-2xl transition-all text-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-8 py-4.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold rounded-2xl transition-all shadow-xl shadow-red-200 text-lg flex items-center justify-center gap-2"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
