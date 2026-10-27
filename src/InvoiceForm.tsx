import React, { useState, useEffect } from 'react';
import { Party, InventoryItem, Item, Estimate } from './types';
import { UNIT_SUGGESTIONS } from './constants';

export function InvoiceForm({ 
  parties, 
  inventoryItems, 
  isSale = true,
  onSave, 
  onCancel,
  initialData,
  allTransactions = []
}: { 
  parties: Party[], 
  inventoryItems: InventoryItem[],
  isSale?: boolean,
  onSave: (estimate: Estimate) => void, 
  onCancel: () => void,
  initialData?: Estimate,
  allTransactions?: Estimate[]
}) {
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
  const [billingAddress, setBillingAddress] = useState(initialData?.billingAddress || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  
  const selectedParty = parties.find(p => p.name && (p.name.toLowerCase() === (customerName || '').toLowerCase()));

  useEffect(() => {
    if (selectedParty && !initialData) {
      setCustomerPhone(selectedParty.phone || '');
      setBillingAddress(selectedParty.billingAddress || '');
    }
  }, [selectedParty, initialData]);
  
  useEffect(() => {
    if (initialData && initialData.isSale === isSale) return;
    
    // Calculate next refNo for this type (starting from 1)
    const filteredTxns = allTransactions.filter(t => t.isSale === isSale && t.txnType !== 'Payment-In');
    const maxRef = filteredTxns.reduce((max, t) => {
        const val = Number(t.refNo);
        return isNaN(val) ? max : Math.max(max, val);
    }, 0);
    setRefNo(maxRef < 1 ? 1 : maxRef + 1);
  }, [allTransactions, initialData, isSale]);

  const nextPartyRef = (parties || []).reduce((max, p) => {
    const val = parseInt(String(p?.customerRefNo || 0), 10);
    return isNaN(val) ? max : Math.max(max, val);
  }, 0) + 1;
  const safeNextPartyRef = isNaN(nextPartyRef) ? 1 : nextPartyRef;

  const [refNo, setRefNo] = useState<number | null>((initialData && initialData.isSale === isSale) ? initialData.refNo : null);
  const [status, setStatus] = useState<'Open'|'Closed'>(initialData?.status as any || 'Open');
  const [items, setItems] = useState<Item[]>(initialData?.items && initialData.items.length > 0 ? initialData.items : [{ id: Date.now().toString(), name: '', quantity: '' as any, rate: '' as any, unit: 'None', tax: 0, discount: 0 }]);
  const [receivedAmount, setReceivedAmount] = useState(initialData?.receivedAmount || 0);
  const [paymentType, setPaymentType] = useState(initialData?.paymentType || 'Cash');
  const [isSaving, setIsSaving] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.rate) || 0)), 0);
  const balance = totalAmount - receivedAmount;

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', quantity: '' as any, rate: '' as any, unit: 'None', tax: 0, discount: 0 }]);
  };

  const updateItem = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items];
    if (field === 'name') {
       const invItem = inventoryItems.find(i => i.name === value);
       if (invItem) {
          newItems[index] = { ...newItems[index], name: invItem.name, rate: invItem.price };
       } else {
          newItems[index] = { ...newItems[index], name: value as string };
       }
    } else {
       newItems[index] = { ...newItems[index], [field]: value } as Item;
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    
    let invoiceNumber = refNo;
    if (!invoiceNumber || isNaN(invoiceNumber)) {
        const filteredTxns = allTransactions.filter(t => t.isSale === isSale);
        const maxRef = filteredTxns.reduce((max, t) => {
            const val = Number(t.refNo);
            return isNaN(val) ? max : Math.max(max, val);
        }, 0);
        invoiceNumber = maxRef < 1 ? 1 : maxRef + 1;
    }

    try {
        await onSave({
          id: initialData?.id || Date.now().toString(),
          customerName,
          customerPhone,
          billingAddress,
          partyId: selectedParty?.id || '',
          customerRefNo: selectedParty?.customerRefNo ?? null,
          date,
          refNo: invoiceNumber,
          status: balance <= 0 ? 'Closed' : 'Open',
          items,
          totalAmount,
          receivedAmount,
          balance,
          isSale,
          paymentType: paymentType as any,
          discountValue: initialData?.discountValue || 0,
          discountType: initialData?.discountType || 'fixed',
          taxType: initialData?.taxType || 'none',
          description: initialData?.description || ''
        });
    } catch (error) {
        setIsSaving(false);
    }
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#f3f4f6', overflowY: 'auto' }}>
      <div style={{ padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>{initialData ? 'Edit' : 'Add'} {isSale ? 'Sale' : 'Estimate'}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
          <button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="btn-primary" 
            style={{ 
                padding: '8px 24px', 
                borderRadius: '4px', 
                border: 'none', 
                backgroundColor: isSaving ? '#94a3b8' : '#3b82f6', 
                color: '#fff', 
                cursor: isSaving ? 'not-allowed' : 'pointer' 
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px', padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Customer Name</label>
            <input 
              list="parties-list"
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)}
              className="input-field" 
              placeholder="Search or enter name"
              style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <datalist id="parties-list">
              {parties.map(p => <option key={p.id} value={p.name}>{`${p.customerRefNo || 'N/A'} - Bal: ${p.balance}`}</option>)}
            </datalist>
            {selectedParty ? (
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                Ref: {selectedParty.customerRefNo || 'N/A'} | Balance: Rs {selectedParty.balance.toLocaleString()}
              </div>
            ) : customerName && (
              <div style={{ fontSize: '14px', color: '#dc2626', marginTop: '4px' }}>
                New Party - Will be assigned Ref: {safeNextPartyRef}
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Phone Number</label>
            <input 
              value={customerPhone} 
              onChange={e => setCustomerPhone(e.target.value)}
              className="input-field" 
              placeholder="Customer Phone"
              style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Billing Address</label>
            <textarea 
              value={billingAddress} 
              onChange={e => setBillingAddress(e.target.value)}
              className="input-field" 
              placeholder="Customer Address"
              rows={1}
              style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="input-field" 
              style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Invoice No.</label>
            <input 
              value={refNo === null || isNaN(refNo) ? '' : refNo} 
              readOnly
              className="input-field" 
              style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#f9fafb' }}
            />
          </div>
          {!isSale && (
            <div>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value as any)}
                className="input-field" 
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#fff' }}
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflowX: 'auto', marginBottom: '32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600, fontSize: '15px' }}>#</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600, fontSize: '15px' }}>Item</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600, fontSize: '15px' }}>Qty</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600, fontSize: '15px' }}>Unit</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600, fontSize: '15px' }}>Price/Unit</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600, fontSize: '15px' }}>Amount</th>
                <th style={{ padding: '16px 20px', width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 20px', fontSize: '15px' }}>{index + 1}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <input 
                      list="items-list"
                      value={item.name} 
                      onChange={e => updateItem(index, 'name', e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '4px', minWidth: '200px' }}
                    />
                    <datalist id="items-list">
                      {inventoryItems.map(i => <option key={i.id} value={i.name} />)}
                    </datalist>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <input 
                      type="number" 
                      value={item.quantity === '' as any ? '' : item.quantity} 
                      onChange={e => updateItem(index, 'quantity', e.target.value === '' ? '' as any : parseFloat(e.target.value))}
                      style={{ width: '90px', padding: '8px 4px', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'right' }}
                    />
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <select 
                      value={item.unit} 
                      onChange={e => updateItem(index, 'unit', e.target.value)}
                      style={{ width: '75px', padding: '8px 4px', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'center' }}
                    >
                      {UNIT_SUGGESTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <input 
                      type="number" 
                      value={item.rate === '' as any ? '' : item.rate} 
                      onChange={e => updateItem(index, 'rate', e.target.value === '' ? '' as any : parseFloat(e.target.value))}
                      style={{ width: '90px', padding: '8px 4px', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'right' }}
                    />
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 500 }}>
                    Rs {((Number(item.quantity) || 0) * (Number(item.rate) || 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)} 
                      style={{ 
                        color: '#ef4444', 
                        border: '1px solid #fee2e2', 
                        background: '#fef2f2', 
                        cursor: 'pointer', 
                        padding: '10px', 
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '16px' }}>
            <button type="button" onClick={addItem} style={{ border: '1px dashed #3b82f6', color: '#3b82f6', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', background: '#eff6ff' }}>Add Item</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>Payment Type</label>
            <div style={{ display: 'flex', gap: '16px' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input type="radio" checked={paymentType === 'Cash'} onChange={() => setPaymentType('Cash')} /> Cash
               </label>
               <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input type="radio" checked={paymentType === 'Cheque'} onChange={() => setPaymentType('Cheque')} /> Cheque
               </label>
               <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input type="radio" checked={paymentType === 'Online'} onChange={() => setPaymentType('Online')} /> Online
               </label>
            </div>
          </div>
          <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280' }}>Total Amount</span>
              <span style={{ fontWeight: 'bold' }}>Rs {totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280' }}>Received Amount</span>
              <input 
                type="number" 
                value={receivedAmount === 0 ? '' : receivedAmount} 
                onChange={e => setReceivedAmount(parseFloat(e.target.value) || 0)}
                style={{ width: '100px', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'right' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
              <span style={{ fontWeight: 'bold' }}>Balance Due</span>
              <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Rs {balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
