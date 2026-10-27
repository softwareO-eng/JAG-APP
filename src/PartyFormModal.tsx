import React, { useState } from 'react';
import { Party } from './types';
import { X } from 'lucide-react';

interface PartyFormModalProps {
    party: Partial<Party>;
    onSave: (party: Partial<Party>) => void;
    onCancel: () => void;
    onDelete?: (id: string | number) => void;
}

export function PartyFormModal({ party, onSave, onCancel, onDelete }: PartyFormModalProps) {
    const [activeTab, setActiveTab] = useState<'Address' | 'Credit' | 'Additional'>('Address');
    const [formData, setFormData] = useState<Partial<Party>>(party);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                {/* Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>{party.id ? 'Edit Party' : 'Add Party'}</h2>
                    <X size={24} style={{ cursor: 'pointer', color: '#6b7280' }} onClick={onCancel} />
                </div>

                {/* Main Content Area */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>Party Name *</label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} 
                                    value={formData.name || ''} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="Customer Name"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>Ref No *</label>
                                <input 
                                    type="number" 
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} 
                                    value={formData.customerRefNo === undefined || formData.customerRefNo === null || isNaN(formData.customerRefNo) ? '' : formData.customerRefNo} 
                                    onChange={e => setFormData({...formData, customerRefNo: e.target.value ? Number(e.target.value) : undefined})}
                                    placeholder="Ref No"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>Phone Number</label>
                            <input 
                                type="text" 
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} 
                                value={formData.phone || ''} 
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="Phone Number"
                            />
                        </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '24px', gap: '32px' }}>
                        <div 
                            style={{ padding: '12px 0', fontSize: '14px', fontWeight: activeTab === 'Address' ? 600 : 500, color: activeTab === 'Address' ? '#3b82f6' : '#6b7280', borderBottom: activeTab === 'Address' ? '2px solid #3b82f6' : 'none', cursor: 'pointer' }}
                            onClick={() => setActiveTab('Address')}
                        >
                            Address
                        </div>
                        <div 
                            style={{ padding: '12px 0', fontSize: '14px', fontWeight: activeTab === 'Credit' ? 600 : 500, color: activeTab === 'Credit' ? '#3b82f6' : '#6b7280', borderBottom: activeTab === 'Credit' ? '2px solid #3b82f6' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => setActiveTab('Credit')}
                        >
                            Credit & Balance <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>New</span>
                        </div>
                        <div 
                            style={{ padding: '12px 0', fontSize: '14px', fontWeight: activeTab === 'Additional' ? 600 : 500, color: activeTab === 'Additional' ? '#3b82f6' : '#6b7280', borderBottom: activeTab === 'Additional' ? '2px solid #3b82f6' : 'none', cursor: 'pointer' }}
                            onClick={() => setActiveTab('Additional')}
                        >
                            Additional Fields
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div style={{ minHeight: '200px' }}>
                        {activeTab === 'Address' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>Email ID</label>
                                        <input 
                                            type="email" 
                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} 
                                            value={formData.email || ''} 
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                            placeholder="Email ID"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>Billing Address</label>
                                        <textarea 
                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minHeight: '80px', resize: 'vertical' }} 
                                            value={formData.billingAddress || ''} 
                                            onChange={e => setFormData({...formData, billingAddress: e.target.value})}
                                            placeholder="Billing Address"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '15px', color: '#111827' }}>Shipping Address</span>
                                        <span style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 500, cursor: 'pointer' }}>+ Enable Shipping Address</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'Credit' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>Opening Balance</label>
                                    <input 
                                        type="number" 
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} 
                                        value={formData.balance === undefined || formData.balance === null || isNaN(formData.balance) ? '' : formData.balance} 
                                        onChange={e => setFormData({...formData, balance: e.target.value ? Number(e.target.value) : 0})}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>GSTIN</label>
                                    <input 
                                        type="text" 
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} 
                                        value={formData.gstin || ''} 
                                        onChange={e => setFormData({...formData, gstin: e.target.value})}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 'Additional' && (
                            <div style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '40px' }}>
                                No additional fields configured.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                    <div>
                        {party.id && onDelete && (
                            <button 
                                type="button"
                                onClick={() => onDelete(party.id!)}
                                style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', color: '#6b7280', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={onCancel}
                            style={{ padding: '8px 24px', borderRadius: '20px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button 
                            disabled={isSaving}
                            onClick={handleSave}
                            style={{ 
                                padding: '8px 32px', 
                                borderRadius: '20px', 
                                border: 'none', 
                                backgroundColor: isSaving ? '#94a3b8' : '#3b82f6', 
                                color: '#fff', 
                                fontSize: '14px', 
                                fontWeight: 600, 
                                cursor: isSaving ? 'not-allowed' : 'pointer', 
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
                            }}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
