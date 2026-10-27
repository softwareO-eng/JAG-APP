import React, { useState, useEffect } from 'react';
import { InventoryItem } from './types';

export function ItemsModule({ items, onAddItem, onEditItem, onDeleteItem }: { items: InventoryItem[], onAddItem: () => void, onEditItem: (item: InventoryItem) => void, onDeleteItem?: (id: string) => void }) {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

    useEffect(() => {
        if (selectedItem && !items.find(i => i.id === selectedItem.id)) {
            setSelectedItem(null);
        }
    }, [items, selectedItem]);

    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
    const lowStockCount = items.filter(item => item.stock < item.minStock).length;

    if (selectedItem) {
        return (
            <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }} onClick={() => setOpenMenuId(null)}>
                <div className="module-header" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#6b7280' }}>
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <h2 className="module-title" style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>{selectedItem.name}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="relative inline-block text-left" style={{ position: 'relative' }}>
                            <button 
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors border border-slate-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === 'HEADER_MENU' ? null : 'HEADER_MENU');
                                }}
                            >
                                <i className="fa-solid fa-ellipsis-vertical px-1"></i>
                            </button>
                            {openMenuId === 'HEADER_MENU' && (
                                <div className="absolute right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5 overflow-hidden py-1 z-50 border border-slate-100 ring-1 ring-black ring-opacity-5 z-20 transition-all font-sans text-left">
                                    <div className="py-1">
                                        <button 
                                            className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-indigo-600"
                                            onClick={(e) => { e.stopPropagation(); onEditItem(selectedItem); setOpenMenuId(null); }}
                                        >
                                            <i className="fa-solid fa-pen-to-square w-5"></i> Edit Item
                                        </button>
                                        {onDeleteItem && (
                                            <button 
                                                className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-red-600 gap-4 hover:bg-red-50 border-t border-slate-100 mt-1 pt-1.5"
                                                onClick={(e) => { e.stopPropagation(); onDeleteItem(String(selectedItem.id)); setOpenMenuId(null); }}
                                            >
                                                <i className="fa-solid fa-trash w-5"></i> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '0 24px 24px 24px' }}>
                    <div className="summary-cards" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Sales Price</div>
                            <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Rs {selectedItem.price.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>Current Selling Price</div>
                        </div>
                        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Stock Quantity</div>
                            <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: selectedItem.stock < selectedItem.minStock ? '#ef4444' : '#111827' }}>
                                {selectedItem.stock} {selectedItem.unit}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                                <span>Min Stock: {selectedItem.minStock}</span>
                                {selectedItem.stock < selectedItem.minStock && <span style={{ color: '#ef4444', fontWeight: 600 }}>Low Stock!</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }} onClick={() => setOpenMenuId(null)}>
            <div className="module-header" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="module-title" style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>Items <i className="fa-solid fa-chevron-down" style={{ fontSize: '14px', marginLeft: '8px', color: '#6b7280' }}></i></h2>
                <button className="btn btn-primary-red" onClick={onAddItem} style={{ backgroundColor: 'var(--accent-red)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <i className="fa-solid fa-plus"></i> Add Item
                </button>
            </div>
            
            <div style={{ padding: '0 24px 24px 24px' }}>
                <div className="filters-bar" style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                    <span style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500 }}>Filter by:</span>
                    <select className="filter-dropdown" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 12px', fontSize: '15px', outline: 'none' }}><option>All Categories</option></select>
                    <div className="filter-dropdown" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 12px', fontSize: '15px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <i className="fa-solid fa-search" style={{ color: '#6b7280' }}></i> <input type="text" placeholder="Search Item" style={{ border: 'none', outline: 'none', background: 'transparent' }} />
                    </div>
                </div>

                <div className="summary-cards" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Total Items</div>
                        <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{items.length}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>Unique inventory items</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Total Stock</div>
                        <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{totalStock}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>Total units in inventory</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Low Stock Alerts</div>
                        <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: lowStockCount > 0 ? '#ef4444' : '#111827' }}>{lowStockCount}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>Items at or below minimum level</div>
                    </div>
                </div>

                <div className="table-container" style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Item Name</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Sales Price</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Purchase Price</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Stock Quantity</th>
                                <th style={{ padding: '16px 20px', width: '100px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }} className="hover:bg-slate-50 transition-colors">
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', fontWeight: 500 }}>{item.name}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', textAlign: 'right' }}>Rs {item.price.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', textAlign: 'right' }}>Rs {(item.price * 0.7).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: item.stock < item.minStock ? '#ef4444' : '#111827', textAlign: 'right', fontWeight: 500 }}>
                                        {item.stock} {item.unit}
                                        {item.stock < item.minStock && <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#ef4444', marginLeft: '8px' }}>(Low)</span>}
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                            <button 
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                                onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                            >
                                                <i className="fa-solid fa-eye"></i> View
                                            </button>

                                            <div className="relative inline-block text-left" style={{ position: 'relative' }}>
                                                <button 
                                                    className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-slate-200 rounded-full transition-all border border-slate-200 bg-white shadow-sm flex items-center justify-center"
                                                    style={{ width: '44px', height: '44px' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === item.id ? null : item.id);
                                                    }}
                                                >
                                                    <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                                                </button>
                                                {openMenuId === item.id && (
                                                    <div className="absolute right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 ring-1 ring-black/5 z-50 transition-all font-sans text-left overflow-hidden py-1">
                                                        <div className="py-2">
                                                            <button 
                                                                className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setOpenMenuId(null); }}
                                                            >
                                                                <i className="fa-solid fa-eye w-6 text-lg text-slate-400 group-hover:text-indigo-500"></i> View Item Details
                                                            </button>
                                                            <button 
                                                                className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); onEditItem(item); setOpenMenuId(null); }}
                                                            >
                                                                <i className="fa-solid fa-pen-to-square w-6 text-lg text-slate-400 group-hover:text-indigo-500"></i> Edit Item
                                                            </button>
                                                        <button 
                                                            className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-red-600 gap-4 hover:bg-red-50 border-t border-slate-100 mt-1 pt-1.5"
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                setOpenMenuId(null);
                                                                if (onDeleteItem) onDeleteItem(String(item.id));
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-trash w-6 text-lg text-red-400 group-hover:text-red-600 transition-colors"></i> Delete Item
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                                        <div style={{ marginBottom: '12px', fontSize: '24px' }}><i className="fa-solid fa-box-open"></i></div>
                                        <div>No items added yet</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
