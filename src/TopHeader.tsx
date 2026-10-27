import React from 'react';

export function TopHeader({ title, onAction, onSearch }: { title: string, onAction: (action: string) => void, onSearch?: (q: string) => void }) {
    return (
        <header className="bg-white border-b border-slate-200 h-14 px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 w-8 h-8 rounded flex items-center justify-center text-white font-bold">
                    {title.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold text-slate-800 leading-tight truncate max-w-[200px]" title={title}>{title}</h1>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Online</span>
                    </div>
                </div>
                {onSearch && (
                  <div className="ml-4">
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
                      onChange={(e) => onSearch(e.target.value)}
                    />
                  </div>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => onAction('ADD_SALE')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                    <i className="fa-solid fa-plus text-[10px]"></i> Add Sale
                </button>
                
                <div className="h-6 w-px bg-slate-200"></div>
                
                <div className="flex items-center gap-3 text-slate-400">
                    <button className="p-1.5 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => onAction('PROFILE_EDIT')}>
                        <i className="fa-solid fa-gear"></i>
                    </button>
                    <button className="p-1.5 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <i className="fa-solid fa-circle-question"></i>
                    </button>
                    <div className="flex items-center gap-2 pl-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <i className="fa-solid fa-user text-slate-400 text-xs"></i>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
