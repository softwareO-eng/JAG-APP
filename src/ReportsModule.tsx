import React from 'react';
import { Estimate, Party, InventoryItem } from './types';
import { FileBarChart, Users, Package, AlertTriangle, TrendingUp } from 'lucide-react';

export function ReportsModule({ sales, parties, items, onNavigate, onExportExcel }: { sales: Estimate[], parties: Party[], items: InventoryItem[], onNavigate?: (view: any) => void, onExportExcel?: () => void }) {
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPartiesBalance = parties.reduce((sum, p) => sum + (p.balance || 0), 0);
    const totalItems = items.length;
    const stockValue = items.reduce((sum, i) => sum + (i.stock * i.price), 0);
    const lowStockItems = items.filter(i => i.stock <= (i.minStock || 0));

    return (
        <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
            <div className="module-header" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="module-title" style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>Reports <i className="fa-solid fa-chevron-down" style={{ fontSize: '14px', marginLeft: '8px', color: '#6b7280' }}></i></h2>
                <button className="btn btn-primary-red" onClick={onExportExcel} style={{ backgroundColor: 'var(--accent-red)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <i className="fa-solid fa-download"></i> Download Full Report (Excel)
                </button>
            </div>

            <div style={{ padding: '0 24px 24px 24px' }}>
                <div className="filters-bar" style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                    <span style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500 }}>Filter by:</span>
                    <select className="filter-dropdown" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 12px', fontSize: '15px', outline: 'none' }}><option>This Month</option></select>
                    <div className="filter-dropdown" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 12px', fontSize: '15px', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}>
                        <i className="fa-regular fa-calendar" style={{ color: '#6b7280' }}></i> This Month
                    </div>
                </div>

                <div className="summary-cards" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-chart-line" style={{ color: '#6366f1' }}></i> Total Sales</div>
                        <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Rs {totalSales.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>Total revenue accumulated from all transactions</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-users" style={{ color: '#10b981' }}></i> Total Receivable</div>
                        <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Rs {totalPartiesBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>From {parties.filter(p => p.balance > 0).length} outstanding parties</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-box" style={{ color: '#3b82f6' }}></i> Stock Valuation</div>
                        <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Rs {stockValue.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>Current value across {totalItems} unique items</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '24px' }}>
                    <div className="table-container" style={{ flex: 2, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>Recent Transaction History</h3>
                            <button onClick={() => onNavigate?.('SALE_LIST')} style={{ fontSize: '14px', color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View Sales Ledger</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Customer/Party</th>
                                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.slice(-10).reverse().map(sale => (
                                    <tr key={sale.id} style={{ borderBottom: '1px solid #E5E7EB', cursor: 'pointer' }} className="hover:bg-slate-50 transition-colors">
                                        <td style={{ padding: '16px 20px', fontSize: '15px', color: '#4b5563' }}>{sale.date}</td>
                                        <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', fontWeight: 500 }}>{sale.customerName}</td>
                                        <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', textAlign: 'right', fontWeight: 600 }}>Rs {sale.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                    </tr>
                                ))}
                                {sales.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '15px', fontStyle: 'italic' }}>
                                            No transaction records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }}></i>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>Critical Stock Alerts</h3>
                            </div>
                            {lowStockItems.length > 0 && <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>{lowStockItems.length} NEEDS ATTENTION</span>}
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                            {lowStockItems.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {lowStockItems.map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', borderLeft: '4px solid transparent' }} className="hover:bg-slate-50 hover:border-red-400 transition-colors">
                                            <div>
                                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{item.name}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>Current Stock: <span style={{ fontWeight: 600, color: '#ef4444' }}>{item.stock}</span> {item.unit}</div>
                                            </div>
                                            <button onClick={() => onNavigate?.('ITEMS_LIST')} style={{ padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#374151', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer' }} className="hover:bg-slate-200 transition-colors">
                                                Restock
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                                    <i className="fa-solid fa-box" style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.2 }}></i>
                                    <span style={{ fontSize: '15px', fontWeight: 500, color: '#6b7280' }}>Inventory is healthy</span>
                                    <span style={{ fontSize: '11px' }}>All items are above threshold levels</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
