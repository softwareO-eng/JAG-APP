import React, { useState } from 'react';
import { Estimate } from './types';

export function PaymentInModule({ 
    sales, 
    onAddPaymentIn,
    onViewSale,
    onViewReceipt,
    onDelete
}: { 
    sales: Estimate[], 
    onAddPaymentIn: () => void,
    onViewSale: (sale: Estimate, autoShare?: boolean) => void,
    onViewReceipt: (sale: Estimate, autoShare?: boolean) => void,
    onDelete: (id: string) => void
}) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const filteredSales = sales.filter(s => s.txnType === 'Payment-In');
    const totalReceived = filteredSales.reduce((sum, s) => sum + (s.receivedAmount || 0), 0);

    return (
        <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }} onClick={() => setOpenMenuId(null)}>
            <div className="module-header" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="module-title" style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>Payment-In <i className="fa-solid fa-chevron-down" style={{ fontSize: '14px', marginLeft: '8px', color: '#6b7280' }}></i></h2>
                <button className="btn btn-primary-red" onClick={onAddPaymentIn} style={{ backgroundColor: 'var(--accent-red)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <i className="fa-solid fa-plus"></i> Add Payment-In
                </button>
            </div>
            
            <div style={{ padding: '0 24px 24px 24px' }}>
                <div className="filters-bar" style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                    <span style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500 }}>Filter by:</span>
                    <select className="filter-dropdown" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 12px', fontSize: '15px', outline: 'none' }}><option>This Month</option></select>
                    <div className="filter-dropdown" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 12px', fontSize: '15px', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}>
                        <i className="fa-regular fa-calendar" style={{ color: '#6b7280' }}></i> This Month
                    </div>
                    <select className="filter-dropdown" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 12px', fontSize: '15px', outline: 'none' }}><option>All Firms</option></select>
                </div>

                <div className="summary-cards" style={{ width: '350px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Total Amount</div>
                            <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Rs {totalReceived.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                        </div>
                    </div>
                    <div className="card-footer" style={{ display: 'flex', fontSize: '14px', color: '#6b7280', borderTop: '1px solid #f3f4f6', paddingTop: '12px', justifyContent: 'space-between' }}>
                        <span>Received: <b style={{ color: '#111827' }}>Rs {totalReceived.toLocaleString('en-IN', {minimumFractionDigits: 2})}</b></span>
                    </div>
                </div>

                <div className="table-container" style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Inv No.</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Cust Ref No.</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Party Name</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Payment Type</th>
                                <th style={{ padding: '16px 20px', width: '100px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(sale => (
                                <tr key={sale.id} style={{ borderBottom: '1px solid #E5E7EB' }} className="hover:bg-slate-50 transition-colors">
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827' }}>{sale.date}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827' }}>{sale.refNo || sale.id.slice(0, 4)}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827' }}>{sale.customerRefNo || '-'}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', fontWeight: 500 }}>{sale.customerName}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', textAlign: 'right' }}>Rs {(sale.receivedAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827' }}>{sale.paymentType || 'Cash'}</td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                        <div className="relative flex justify-end gap-2 items-center">
                                            <button 
                                                className="btn-view"
                                                onClick={(e) => { e.stopPropagation(); onViewReceipt(sale); }}
                                                style={{ fontSize: '15px', background: 'var(--accent-red)', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                Receipt
                                            </button>
                                            <button 
                                                className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-slate-200 rounded-full transition-all border border-slate-200 bg-white shadow-sm flex items-center justify-center"
                                                style={{ width: '44px', height: '44px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === sale.id ? null : sale.id);
                                                }}
                                            >
                                                <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                                            </button>
                                            {openMenuId === sale.id && (
                                                <div className="absolute right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 ring-1 ring-black/5 z-50 transition-all font-sans text-left overflow-hidden py-1">
                                                    <div className="py-2">
                                                        <button 
                                                            className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); onViewSale(sale); setOpenMenuId(null); }}
                                                        >
                                                            <i className="fa-solid fa-file-pdf w-6 text-lg text-slate-400 group-hover:text-indigo-500"></i> PDF Download
                                                        </button>
                                                        <button 
                                                            className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); onViewReceipt(sale); setOpenMenuId(null); }}
                                                        >
                                                            <i className="fa-solid fa-receipt w-6 text-lg text-slate-400 group-hover:text-emerald-500"></i> Official Receipt
                                                        </button>
                                                        <button 
                                                            className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-green-600 gap-4 hover:bg-green-50 transition-colors"
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                onViewReceipt(sale, true);
                                                                setOpenMenuId(null); 
                                                            }}
                                                        >
                                                            <i className="fa-brands fa-whatsapp w-6 text-lg text-green-500 group-hover:scale-110 transition-transform"></i> Share PDF
                                                        </button>
                                                        <button 
                                                            className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-red-600 gap-4 hover:bg-red-50 border-t border-slate-100 transition-colors"
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                onDelete(sale.id); 
                                                                setOpenMenuId(null); 
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-trash w-6 text-lg text-red-400 group-hover:text-red-600"></i> Delete Transaction
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                                        <div style={{ marginBottom: '12px', fontSize: '24px' }}><i className="fa-solid fa-file-invoice"></i></div>
                                        <div>No payment-in recorded yet</div>
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
