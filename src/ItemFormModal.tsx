import React, { useState, useEffect } from 'react';
import { InventoryItem } from './types';
import { X } from 'lucide-react';

interface ItemFormModalProps {
  item: Partial<InventoryItem>;
  onSave: (item: Partial<InventoryItem>) => void;
  onCancel: () => void;
  onDelete?: (id: string | number) => void;
}

export function ItemFormModal({ item, onSave, onCancel, onDelete }: ItemFormModalProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    price: '' as any,
    unit: 'None',
    stock: '' as any,
    minStock: '' as any,
    ...item
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>{item.id ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Item Name *</label>
              <input 
                type="text" 
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Sales Price (Rs)</label>
                <input 
                  type="number"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  value={formData.price === '' as any || formData.price === undefined || formData.price === null || isNaN(formData.price as any) ? '' : formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value === '' ? '' as any : Number(e.target.value) })}
                />
              </div>
              <div style={{ width: '120px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Unit</label>
                <select 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="None">None</option>
                  <option value="PCS">PCS</option>
                  <option value="FT">FT</option>
                  <option value="RFT">RFT</option>
                  <option value="SQF">SQF</option>
                  <option value="SQM">SQM</option>
                  <option value="IN">IN</option>
                  <option value="SET">SET</option>
                  <option value="UNIT">UNIT</option>
                  <option value="KG">KG</option>
                  <option value="MTR">MTR</option>
                  <option value="BOX">BOX</option>
                  <option value="LTR">LTR</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Opening Stock</label>
                <input 
                  type="number"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  value={formData.stock === '' as any || formData.stock === undefined || formData.stock === null || isNaN(formData.stock as any) ? '' : formData.stock}
                  onChange={e => setFormData({ ...formData, stock: e.target.value === '' ? '' as any : Number(e.target.value) })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Min Stock Alert</label>
                <input 
                  type="number"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  value={formData.minStock === '' as any || formData.minStock === undefined || formData.minStock === null || isNaN(formData.minStock as any) ? '' : formData.minStock}
                  onChange={e => setFormData({ ...formData, minStock: e.target.value === '' ? '' as any : Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
            {onDelete && item.id && (
              <button 
                type="button"
                onClick={() => onDelete(item.id!)}
                style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Delete Item
              </button>
            )}
            <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
              <button 
                type="button" 
                onClick={onCancel}
                style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', background: '#fff' }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{ padding: '10px 24px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Save Item
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
