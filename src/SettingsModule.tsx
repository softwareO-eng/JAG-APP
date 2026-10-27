import React, { useState, useRef, useEffect } from 'react';
import { CompanyData } from './types';
import { Save, ArrowLeft, Building, Mail, Phone, MapPin, FileText, Pencil, X, Trash2 } from 'lucide-react';
import SignaturePad from 'signature_pad';

interface SettingsModuleProps {
    companyData: CompanyData;
    onChange: (data: CompanyData) => void;
    onBack: () => void;
    onDeleteAllParties?: () => void;
    onDeleteAllTransactions?: () => void;
    onDeleteAllItems?: () => void;
}

export function SettingsModule({ companyData, onChange, onBack, onDeleteAllParties, onDeleteAllTransactions, onDeleteAllItems }: SettingsModuleProps) {
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sigPad = useRef<SignaturePad | null>(null);

    useEffect(() => {
        if (showSignatureModal && canvasRef.current && !sigPad.current) {
            sigPad.current = new SignaturePad(canvasRef.current, {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                penColor: 'rgb(0, 0, 0)'
            });
            // Handle high DPI displays
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvasRef.current.width = canvasRef.current.offsetWidth * ratio;
            canvasRef.current.height = canvasRef.current.offsetHeight * ratio;
            canvasRef.current.getContext("2d")?.scale(ratio, ratio);
            sigPad.current.clear();
        }
    }, [showSignatureModal]);

    const handleSignatureSave = () => {
        if (sigPad.current && !sigPad.current.isEmpty()) {
            const dataUrl = sigPad.current.toDataURL();
            onChange({ ...companyData, signature: dataUrl });
        }
        setShowSignatureModal(false);
        sigPad.current = null;
    };

    return (
        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100%', overflowY: 'auto' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <button 
                        onClick={onBack}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#6b7280' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: 0 }}>Business Settings</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    {/* General Information */}
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building size={20} color="#3b82f6" /> Business Information
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#4b5563', marginBottom: '8px' }}>Business Name</label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none' }} 
                                    value={companyData.name} 
                                    onChange={e => onChange({...companyData, name: e.target.value})}
                                    placeholder="Enter business name"
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#4b5563', marginBottom: '8px' }}>
                                    <Mail size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Email Address
                                </label>
                                <input 
                                    type="email" 
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none' }} 
                                    value={companyData.email} 
                                    onChange={e => onChange({...companyData, email: e.target.value})}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#4b5563', marginBottom: '8px' }}>
                                    <Phone size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Phone Number
                                </label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none' }} 
                                    value={companyData.phone} 
                                    onChange={e => onChange({...companyData, phone: e.target.value})}
                                    placeholder="e.g. +91 00000 00000"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#4b5563', marginBottom: '8px' }}>
                                    <Phone size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Landline Number (Optional)
                                </label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none' }} 
                                    value={companyData.landline || ''} 
                                    onChange={e => onChange({...companyData, landline: e.target.value})}
                                    placeholder="e.g. 051-XXXXXXX"
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#4b5563', marginBottom: '8px' }}>
                                    <MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Business Address
                                </label>
                                <textarea 
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', minHeight: '100px', resize: 'vertical' }} 
                                    value={companyData.address} 
                                    onChange={e => onChange({...companyData, address: e.target.value})}
                                    placeholder="Full street address, city, state, zip"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Settings */}
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} color="#3b82f6" /> Document Settings
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#4b5563', marginBottom: '8px' }}>Business Logo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '80px', height: '80px', border: '2px dashed #d1d5db', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
                                        {companyData.logo ? (
                                            <img src={companyData.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <Building size={32} color="#9ca3af" />
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        id="logo-upload"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => onChange({...companyData, logo: reader.result as string});
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <label htmlFor="logo-upload" style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', fontWeight: 500, color: '#4b5563', cursor: 'pointer' }}>
                                        Change Logo
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#4b5563', marginBottom: '8px' }}>Authorized Signature</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '120px', height: '80px', border: '2px dashed #d1d5db', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
                                        {companyData.signature ? (
                                            <img src={companyData.signature} alt="Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <FileText size={32} color="#9ca3af" />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                style={{ display: 'none' }} 
                                                id="sig-upload"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => onChange({...companyData, signature: reader.result as string});
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <label htmlFor="sig-upload" style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontWeight: 500, color: '#4b5563', cursor: 'pointer' }}>
                                                Upload
                                            </label>
                                            <button 
                                                onClick={() => setShowSignatureModal(true)}
                                                style={{ padding: '8px 12px', backgroundColor: '#fff', border: '1px solid #3b82f6', borderRadius: '6px', fontSize: '14px', fontWeight: 500, color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                <Pencil size={14} /> Draw
                                            </button>
                                        </div>
                                        {companyData.signature && (
                                            <button 
                                                onClick={() => onChange({...companyData, signature: undefined})}
                                                style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: 'fit-content' }}
                                            >
                                                Remove Signature
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#4b5563', marginBottom: '8px' }}>Terms & Conditions</label>
                            <textarea 
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', minHeight: '100px', resize: 'vertical' }} 
                                value={companyData.terms || ''} 
                                onChange={e => onChange({...companyData, terms: e.target.value})}
                                placeholder="These will appear at the bottom of your invoices and estimates"
                            />
                        </div>
                    </div>

                    {/* Danger Zone / Data Management */}
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#991b1b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} color="#ef4444" /> Data Management (Testing Mode)
                        </h3>
                        <p style={{ fontSize: '14px', color: '#7f1d1d', marginBottom: '24px' }}>
                            Warning: These actions are permanent and cannot be undone. Use them to reset your data during testing.
                        </p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {onDeleteAllParties && (
                                <button 
                                    onClick={onDeleteAllParties}
                                    style={{ 
                                        padding: '10px 20px', 
                                        backgroundColor: '#fff', 
                                        color: '#ef4444', 
                                        border: '1px solid #fca5a5', 
                                        borderRadius: '8px', 
                                        fontSize: '14px', 
                                        fontWeight: 600, 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <i className="fa-solid fa-users-slash"></i> Delete All Parties
                                </button>
                            )}
                            {onDeleteAllTransactions && (
                                <button 
                                    onClick={onDeleteAllTransactions}
                                    style={{ 
                                        padding: '10px 20px', 
                                        backgroundColor: '#fff', 
                                        color: '#ef4444', 
                                        border: '1px solid #fca5a5', 
                                        borderRadius: '8px', 
                                        fontSize: '14px', 
                                        fontWeight: 600, 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <i className="fa-solid fa-trash-can"></i> Delete All Transactions
                                </button>
                            )}
                            {onDeleteAllItems && (
                                <button 
                                    onClick={onDeleteAllItems}
                                    style={{ 
                                        padding: '10px 20px', 
                                        backgroundColor: '#fff', 
                                        color: '#ef4444', 
                                        border: '1px solid #fca5a5', 
                                        borderRadius: '8px', 
                                        fontSize: '14px', 
                                        fontWeight: 600, 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <i className="fa-solid fa-boxes-stacked"></i> Delete All Items
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                        <button 
                            onClick={onBack}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '12px 32px', 
                                backgroundColor: '#3b82f6', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontSize: '16px', 
                                fontWeight: 600, 
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                        >
                            <Save size={18} /> Save Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Signature Modal */}
            {showSignatureModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '448px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', animation: 'zoomIn 0.2s ease-out' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                            <h3 style={{ fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <Pencil size={18} color="#3b82f6" /> Draw Signature
                            </h3>
                            <button onClick={() => setShowSignatureModal(false)} style={{ color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ backgroundColor: '#fff', border: '2px solid #cbd5e1', borderRadius: '12px', position: 'relative', width: '100%', height: '192px', cursor: 'crosshair', overflow: 'hidden' }}>
                                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, touchAction: 'none' }}></canvas>
                                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                    <button 
                                        onClick={() => sigPad.current?.clear()} 
                                        style={{ padding: '8px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}
                                    >
                                        <Trash2 size={14} /> Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'end', gap: '12px' }}>
                            <button onClick={() => setShowSignatureModal(false)} style={{ padding: '10px 20px', fontWeight: 'bold', color: '#475569', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '12px' }}>Cancel</button>
                            <button 
                                onClick={handleSignatureSave} 
                                style={{ padding: '10px 24px', backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)' }}
                            >
                                Save Signature
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
