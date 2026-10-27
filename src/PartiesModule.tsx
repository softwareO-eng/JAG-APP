import React, { useState, useEffect } from 'react';
import { Party, Estimate } from './types';

export function PartiesModule({ 
    parties, 
    sales,
    estimates,
    onAddParty,
    onEditParty,
    onViewTransaction,
    onViewReceipt,
    onEditSale,
    onEditEstimate,
    onPaymentIn,
    onDeleteParty
}: { 
    parties: Party[], 
    sales: Estimate[],
    estimates: Estimate[],
    onAddParty: () => void,
    onEditParty: (party: Party) => void,
    onViewTransaction: (txn: Estimate, autoShare?: boolean) => void,
    onViewReceipt?: (txn: Estimate, autoShare?: boolean) => void,
    onEditSale?: (txn: Estimate) => void,
    onEditEstimate?: (txn: Estimate) => void,
    onPaymentIn?: (party: Party) => void,
    onDeleteParty?: (partyId: string) => void
}) {
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    useEffect(() => {
        if (selectedParty && !parties.find(p => p.id === selectedParty.id)) {
            setSelectedParty(null);
        }
    }, [parties, selectedParty]);

    const transactions = [...sales, ...estimates];
    const partyTransactions = transactions.filter(t => t.partyId === selectedParty?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleEditTxn = (txn: Estimate) => {
        setMenuOpenId(null);
        if (txn.isSale && onEditSale) {
            onEditSale(txn);
        } else if (!txn.isSale && onEditEstimate) {
            onEditEstimate(txn);
        }
    };

    const totalBalance = parties.reduce((sum, party) => sum + party.balance, 0);
    const totalReceivable = parties.filter(p => p.balance > 0).reduce((sum, party) => sum + party.balance, 0);
    const totalPayable = parties.filter(p => p.balance < 0).reduce((sum, party) => sum + Math.abs(party.balance), 0);

    if (selectedParty) {
        return (
            <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }} onClick={() => setMenuOpenId(null)}>
                <div className="module-header" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setSelectedParty(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#6b7280' }}>
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <h2 className="module-title" style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }} title={selectedParty.name}>{selectedParty.name}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {onPaymentIn && (
                            <button className="btn" onClick={() => onPaymentIn(selectedParty)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <i className="fa-solid fa-money-bill-transfer"></i> Payment In
                            </button>
                        )}
                        <div className="relative inline-block text-left" style={{ position: 'relative' }}>
                            <button 
                                className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-slate-200 rounded-full transition-all border border-slate-200 bg-white shadow-sm flex items-center justify-center"
                                style={{ width: '44px', height: '44px' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenId(menuOpenId === 'HEADER_MENU' ? null : 'HEADER_MENU');
                                }}
                            >
                                <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                            </button>
                            {menuOpenId === 'HEADER_MENU' && (
                                <div className="absolute right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5 overflow-hidden py-1 z-50 border border-slate-100 ring-1 ring-black ring-opacity-5 z-20 transition-all font-sans text-left">
                                    <div className="py-1">
                                        <button 
                                            className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-indigo-600"
                                            onClick={(e) => { e.stopPropagation(); onEditParty(selectedParty); setMenuOpenId(null); }}
                                        >
                                            <i className="fa-solid fa-pen-to-square w-5"></i> Edit Party
                                        </button>
                                        {onDeleteParty && (
                                            <button 
                                                className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-red-600 gap-4 hover:bg-red-50 border-t border-slate-100 mt-1 pt-1.5"
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    onDeleteParty(String(selectedParty.id)); 
                                                    setMenuOpenId(null); 
                                                    setSelectedParty(null);
                                                }}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500 }}>Party Balance</div>
                                <div style={{ background: selectedParty.balance >= 0 ? '#d1fae5' : '#fee2e2', color: selectedParty.balance >= 0 ? '#10b981' : '#ef4444', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>
                                    {selectedParty.balance >= 0 ? 'RECEIVABLE' : 'PAYABLE'}
                                </div>
                            </div>
                            <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: selectedParty.balance >= 0 ? '#10b981' : '#ef4444' }}>
                                Rs {Math.abs(selectedParty.balance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </div>
                        </div>

                        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '12px' }}>Contact Details</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '15px', color: '#4b5563' }}>
                                <div><i className="fa-solid fa-phone" style={{ width: '20px', color: '#9ca3af' }}></i> {selectedParty.phone || 'No phone provided'}</div>
                                <div><i className="fa-solid fa-location-dot" style={{ width: '20px', color: '#9ca3af' }}></i> {selectedParty.billingAddress || 'No address provided'}</div>
                            </div>
                        </div>

                        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Total Transactions</div>
                            <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                                {partyTransactions.length}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>Amounting to Rs {partyTransactions.reduce((sum, t) => sum + t.totalAmount, 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                        </div>
                    </div>

                    <div className="table-container" style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>Transactions with {selectedParty.name}</h3>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Type</th>
                                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Inv No</th>
                                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Cust Ref No</th>
                                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
                                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Balance</th>
                                    <th style={{ padding: '16px 20px', width: '100px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {partyTransactions.map(txn => (
                                    <tr key={txn.id} style={{ borderBottom: '1px solid #E5E7EB' }} className="hover:bg-slate-50 transition-colors">
                                        <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', fontWeight: 500 }}>{txn.txnType === 'Payment-In' ? 'Payment In' : (txn.isSale ? 'Sale' : 'Estimate')}</td>
                                        <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827' }}>{txn.refNo}</td>
                                        <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827' }}>{txn.customerRefNo || '-'}</td>
                                        <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827' }}>{txn.date}</td>
                                        <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', textAlign: 'right' }}>Rs {txn.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                        <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', textAlign: 'right' }}>Rs {(txn.isSale ? txn.balance : 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                                <button 
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        if (txn.items.length === 0 && (txn.receivedAmount || 0) > 0) {
                                                            onViewReceipt?.(txn);
                                                        } else {
                                                            onViewTransaction(txn); 
                                                        }
                                                    }}
                                                >
                                                    <i className="fa-solid fa-eye"></i> View
                                                </button>

                                                <div className="relative inline-block text-left" style={{ position: 'relative' }}>
                                                    <button 
                                                        className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-slate-200 rounded-full transition-all border border-slate-200 bg-white shadow-sm flex items-center justify-center"
                                                        style={{ width: '44px', height: '44px' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMenuOpenId(menuOpenId === txn.id ? null : txn.id);
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                                                    </button>
                                                    {menuOpenId === txn.id && (
                                                        <div className="absolute right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 ring-1 ring-black/5 z-50 transition-all font-sans text-left overflow-hidden py-1">
                                                            <div className="py-2">
                                                                    <button 
                                                                        className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                                                        onClick={(e) => { e.stopPropagation(); onViewTransaction(txn); setMenuOpenId(null); }}
                                                                    >
                                                                        <i className="fa-solid fa-file-pdf w-6 text-lg text-slate-400 group-hover:text-indigo-500"></i> PDF Download
                                                                    </button>
                                                                    <button 
                                                                        className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                                                                        onClick={(e) => { e.stopPropagation(); onViewReceipt?.(txn); setMenuOpenId(null); }}
                                                                    >
                                                                        <i className="fa-solid fa-receipt w-6 text-lg text-slate-400 group-hover:text-emerald-500"></i> View Receipt
                                                                    </button>
                                                                    <button 
                                                                        className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-green-600 gap-4 hover:bg-green-50 transition-colors"
                                                                        onClick={(e) => { 
                                                                            e.stopPropagation(); 
                                                                            if (txn.items.length === 0 && (txn.receivedAmount || 0) > 0) {
                                                                                onViewReceipt?.(txn, true);
                                                                            } else {
                                                                                onViewTransaction(txn, true); 
                                                                            }
                                                                            setMenuOpenId(null); 
                                                                        }}
                                                                    >
                                                                        <i className="fa-brands fa-whatsapp w-6 text-lg text-green-500 group-hover:scale-110 transition-transform"></i> Share PDF
                                                                    </button>
                                                                <button 
                                                                    className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                                                    onClick={(e) => { e.stopPropagation(); handleEditTxn(txn); }}
                                                                >
                                                                    <i className="fa-solid fa-pen-to-square w-6 text-lg text-slate-400 group-hover:text-indigo-500"></i> Edit Transaction
                                                                </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    </tr>
                                ))}
                                {partyTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                                            <div style={{ marginBottom: '12px', fontSize: '24px' }}><i className="fa-solid fa-file-invoice"></i></div>
                                            <div>No transactions added for this party yet</div>
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

    return (
        <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }} onClick={() => setMenuOpenId(null)}>
            <div className="module-header" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="module-title" style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>Parties <i className="fa-solid fa-chevron-down" style={{ fontSize: '14px', marginLeft: '8px', color: '#6b7280' }}></i></h2>
                <button className="btn btn-primary-red" onClick={onAddParty} style={{ backgroundColor: 'var(--accent-red)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <i className="fa-solid fa-plus"></i> Add Party
                </button>
            </div>
            
            <div style={{ padding: '0 24px 24px 24px' }}>
                <div className="filters-bar" style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                    <span style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500 }}>Filter by:</span>
                    <select className="filter-dropdown" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 12px', fontSize: '15px', outline: 'none' }}><option>All Groups</option></select>
                    <div className="filter-dropdown" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 12px', fontSize: '15px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <i className="fa-solid fa-search" style={{ color: '#6b7280' }}></i> <input type="text" placeholder="Search Party" style={{ border: 'none', outline: 'none', background: 'transparent' }} />
                    </div>
                </div>

                <div className="summary-cards" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Total Balance</div>
                        <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Rs {Math.abs(totalBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>Across {parties.length} total parties</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Receivable</div>
                        <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>Rs {totalReceivable.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>To receive from customers</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="card-title" style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Payable</div>
                        <div className="card-amount" style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>Rs {totalPayable.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>To pay to suppliers</div>
                    </div>
                </div>

                <div className="table-container" style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Ref No.</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Party Name</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Phone Number</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Billing Address</th>
                                <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Balance</th>
                                <th style={{ padding: '16px 20px', width: '100px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parties.map(party => (
                                <tr key={party.id} style={{ borderBottom: '1px solid #E5E7EB' }} className="hover:bg-slate-50 transition-colors">
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', fontWeight: 500 }}>{party.customerRefNo || '-'}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827', fontWeight: 500 }}>
                                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={party.name}>
                                            {party.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827' }}>{party.phone || 'NA'}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: '#111827' }}>{party.billingAddress || 'NA'}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '15px', color: party.balance >= 0 ? '#10b981' : '#ef4444', textAlign: 'right', fontWeight: 500 }}>
                                        Rs {Math.abs(party.balance).toLocaleString('en-IN', {minimumFractionDigits: 2})} 
                                        <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#6b7280', marginLeft: '4px' }}>{party.balance >= 0 ? 'Receivable' : 'Payable'}</span>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                            <button 
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                                onClick={(e) => { e.stopPropagation(); setSelectedParty(party); }}
                                            >
                                                <i className="fa-solid fa-eye"></i> View
                                            </button>

                                            <div className="relative inline-block text-left" style={{ position: 'relative' }}>
                                                <button 
                                                    className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-slate-200 rounded-full transition-all border border-slate-200 bg-white shadow-sm flex items-center justify-center"
                                                    style={{ width: '44px', height: '44px' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpenId(menuOpenId === party.id ? null : party.id);
                                                    }}
                                                >
                                                    <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                                                </button>
                                                {menuOpenId === party.id && (
                                                    <div className="absolute right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 ring-1 ring-black/5 z-50 transition-all font-sans text-left overflow-hidden py-1">
                                                            <div className="py-2">
                                                                <button 
                                                                    className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedParty(party); setMenuOpenId(null); }}
                                                                >
                                                                    <i className="fa-solid fa-eye w-6 text-lg text-slate-400 group-hover:text-indigo-500"></i> View Records
                                                                </button>
                                                                <button 
                                                                    className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-slate-700 gap-4 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                                                    onClick={(e) => { e.stopPropagation(); onEditParty(party); setMenuOpenId(null); }}
                                                                >
                                                                    <i className="fa-solid fa-pen-to-square w-6 text-lg text-slate-400 group-hover:text-indigo-500"></i> Edit Party Info
                                                                </button>
                                                            {onPaymentIn && (
                                                                <button 
                                                                    className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-emerald-600 gap-4 hover:bg-emerald-50 border-t border-slate-100 transition-colors"
                                                                    onClick={(e) => { e.stopPropagation(); onPaymentIn(party); setMenuOpenId(null); }}
                                                                >
                                                                    <i className="fa-solid fa-money-bill-transfer w-6 text-lg group-hover:scale-110 transition-transform"></i> Record Payment
                                                                </button>
                                                            )}
                                                            <button 
                                                                className="group flex w-full items-center px-8 py-5 text-[17px] font-medium text-red-600 gap-4 hover:bg-red-50 border-t border-slate-100 transition-colors"
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    setMenuOpenId(null);
                                                                    if (onDeleteParty) onDeleteParty(String(party.id));
                                                                }}
                                                            >
                                                                <i className="fa-solid fa-trash w-6 text-lg text-red-400 group-hover:text-red-600"></i> Delete Party Info
                                                            </button>
                                                        </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                </tr>
                            ))}
                            {parties.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                                        <div style={{ marginBottom: '12px', fontSize: '24px' }}><i className="fa-solid fa-users"></i></div>
                                        <div>No parties added yet</div>
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
