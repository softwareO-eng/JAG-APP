import React, { useState } from 'react';
import { Party, Item, Estimate } from './types';

export function PaymentInModal({ 
  parties, 
  onSave, 
  onClose,
  initialData
}: { 
  parties: Party[], 
  onSave: (payment: any, viewReceipt: boolean) => void, 
  onClose: () => void,
  initialData?: Partial<Estimate>
}) {
  const initialAmount = initialData ? (
    initialData.totalAmount !== undefined && initialData.receivedAmount !== undefined
      ? (initialData.totalAmount - initialData.receivedAmount).toString()
      : (initialData.receivedAmount || '').toString()
  ) : '';

  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [amount, setAmount] = useState(initialAmount);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [isSaving, setIsSaving] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const selectedParty = parties.find(p => 
    p.name && 
    p.name.toLowerCase().trim() === (customerName || '').toLowerCase().trim()
  );

  const handleSubmit = async (e: React.FormEvent, viewReceipt = false) => {
    e.preventDefault();
    if (!customerName || !amount || isSaving) return;
    setIsSaving(true);
    setErrorStatus(null);

    try {
        await onSave({
          partyId: selectedParty?.id || '',
          customerName: (selectedParty?.name || customerName).trim(),
          receivedAmount: parseFloat(amount),
          totalAmount: parseFloat(amount),
          balance: 0,
          date,
          description,
          paymentType,
          items: [],
          isSale: true,
          txnType: 'Payment-In'
        }, viewReceipt);
    } catch (error: any) {
        setIsSaving(false);
        setErrorStatus("Error saving payment. Check if all fields are correct.");
        console.error("Payment Capture Error:", error);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', width: '500px', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}> <span style={{ color: '#22c55e' }}>●</span> Payment-In</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '18px' }}><i className="fa-solid fa-xmark"></i></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorStatus && (
            <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontSize: '15px' }}>
                {errorStatus}
            </div>
          )}
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Party Name *</label>
            <input 
              list="parties-list-payment"
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Enter or select party name"
              required
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', outline: 'none' }}
            />
            <datalist id="parties-list-payment">
              {parties.map(p => (
                <option key={p.id} value={p.name}>{`${p.customerRefNo || 'N/A'}`}</option>
              ))}
            </datalist>
            {selectedParty ? (
              <div style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
                Ref: {selectedParty.customerRefNo || 'N/A'} | Current Balance: <span style={{ color: selectedParty.balance >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>Rs {Math.abs(selectedParty.balance).toLocaleString()}</span>
              </div>
            ) : customerName && (
               <div style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626' }}>
                New Party will be created
              </div>
            )}
          </div>

          {initialData?.refNo && (
              <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '15px', color: '#374151' }}>
                  <strong>Linked Invoice Reference No:</strong> {initialData.refNo}
              </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Amount Received *</label>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                placeholder="0.00"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Date</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Payment Type</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', cursor: 'pointer' }}>
                <input type="radio" name="paymentType" value="Cash" checked={paymentType === 'Cash'} onChange={e => setPaymentType(e.target.value)} /> Cash
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', cursor: 'pointer' }}>
                <input type="radio" name="paymentType" value="Cheque" checked={paymentType === 'Cheque'} onChange={e => setPaymentType(e.target.value)} /> Cheque
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', cursor: 'pointer' }}>
                <input type="radio" name="paymentType" value="Online" checked={paymentType === 'Online'} onChange={e => setPaymentType(e.target.value)} /> Online
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Description (Optional)</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter payment details..."
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', outline: 'none', height: '80px', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '8px 20px', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 500 }}
            >
              Cancel
            </button>
            <button 
              type="button"
              disabled={isSaving}
              onClick={(e) => handleSubmit(e as any, true)}
              style={{ 
                padding: '8px 24px', 
                border: '1px solid #10b981', 
                borderRadius: '4px', 
                background: '#fff', 
                color: '#10b981', 
                cursor: isSaving ? 'not-allowed' : 'pointer', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-receipt"></i> Save & View Receipt
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              style={{ 
                padding: '8px 24px', 
                border: 'none', 
                borderRadius: '4px', 
                background: isSaving ? '#94a3b8' : '#4f46e5', 
                color: '#fff', 
                cursor: isSaving ? 'not-allowed' : 'pointer', 
                fontWeight: 500 
              }}
            >
              {isSaving ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
