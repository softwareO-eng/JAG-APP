import React, { useState } from 'react';
import { View, CompanyData } from './types';

export function Sidebar({ currentView, setCurrentView, onAction, companyData, isCollapsed, setIsCollapsed }: { 
    currentView: View, 
    setCurrentView: (v: View) => void, 
    onAction: (action: string) => void,
    companyData: CompanyData,
    isCollapsed: boolean,
    setIsCollapsed: (v: boolean) => void
}) {
    const [saleGroupOpen, setSaleGroupOpen] = useState(true);

    return (
        <aside id="sidebar" className={isCollapsed ? 'collapsed' : ''}>
            <div className="sidebar-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <div className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-slate-200 rounded-full transition-all bg-transparent flex items-center justify-center cursor-pointer" style={{ width: '40px', height: '40px' }}>
                    <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                </div>
                {!isCollapsed && <span>Navigation</span>}
            </div>
            
            <nav className="sidebar-nav">
                <button 
                  className={`nav-item ${currentView === 'HOME' ? 'active' : ''} border-0 bg-transparent w-full text-left font-sans text-sm`} 
                  onClick={() => setCurrentView('HOME')}
                >
                    <i className="fa-solid fa-house"></i>
                    <span>Home</span>
                </button>
                
                <button 
                  className={`nav-item ${currentView === 'PARTIES_LIST' ? 'active' : ''} border-0 bg-transparent w-full text-left`} 
                  onClick={() => setCurrentView('PARTIES_LIST')}
                >
                    <i className="fa-solid fa-users"></i>
                    <span>Parties</span>
                </button>
                
                <button 
                  className={`nav-item ${currentView === 'ITEMS_LIST' ? 'active' : ''} border-0 bg-transparent w-full text-left`} 
                  onClick={() => setCurrentView('ITEMS_LIST')}
                >
                    <i className="fa-solid fa-box"></i>
                    <span>Items</span>
                </button>

                <button 
                  className={`nav-item ${currentView === 'PROFILE_EDIT' ? 'active' : ''} border-0 bg-transparent w-full text-left`} 
                  onClick={() => setCurrentView('PROFILE_EDIT')}
                >
                    <i className="fa-solid fa-building"></i>
                    <span>My Company</span>
                </button>
                
                <div className="nav-group">
                    <div className="nav-item group-header" onClick={() => setSaleGroupOpen(!saleGroupOpen)}>
                        <i className="fa-solid fa-receipt"></i>
                        <span>Sale</span>
                        <i className={`fa-solid ${saleGroupOpen ? 'fa-chevron-down' : 'fa-chevron-right'} right-icon group-toggle`}></i>
                    </div>
                    {saleGroupOpen && (
                        <div className="nav-subgroup" id="group-sale">
                            <button 
                              className={`nav-subitem ${currentView === 'SALE_LIST' ? 'active' : ''} border-0 bg-transparent w-full text-left`} 
                              onClick={() => setCurrentView('SALE_LIST')}
                            >
                                <i className="fa-solid fa-file-invoice" style={{ width: '16px', marginRight: '8px' }}></i>
                                <span>Sale Invoices</span>
                                <i className="fa-solid fa-plus right-icon" onClick={(e) => { e.stopPropagation(); setCurrentView('SALE_FORM'); }}></i>
                            </button>
                            <button 
                              className={`nav-subitem ${currentView === 'ESTIMATE_LIST' ? 'active' : ''} border-0 bg-transparent w-full text-left`} 
                              onClick={() => setCurrentView('ESTIMATE_LIST')}
                            >
                                <i className="fa-solid fa-file-lines" style={{ width: '16px', marginRight: '8px' }}></i>
                                <span>Estimate/ Quotation</span>
                                <i className="fa-solid fa-plus right-icon" onClick={(e) => { e.stopPropagation(); setCurrentView('ESTIMATE_FORM'); }}></i>
                            </button>
                            <button className="nav-subitem border-0 bg-transparent w-full text-left">
                                <i className="fa-solid fa-file-circle-check" style={{ width: '16px', marginRight: '8px' }}></i>
                                <span>Proforma Invoice</span>
                            </button>
                            <button 
                                className={`nav-subitem ${currentView === 'PAYMENT_IN_LIST' ? 'active' : ''} border-0 bg-transparent w-full text-left`}
                                onClick={() => setCurrentView('PAYMENT_IN_LIST')}
                            >
                                <i className="fa-solid fa-money-bill-transfer" style={{ width: '16px', marginRight: '8px' }}></i>
                                <span>Payment-In</span>
                            </button>
                            <button 
                                className="nav-subitem border-0 bg-transparent w-full text-left"
                                onClick={() => setCurrentView('SALE_FORM')}
                            >
                                <i className="fa-solid fa-cart-flatbed" style={{ width: '16px', marginRight: '8px' }}></i>
                                <span>Sale Order</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="nav-group">
                    <div className="nav-item group-header">
                        <i className="fa-solid fa-cart-shopping"></i>
                        <span>Purchase & Expense</span>
                        <i className="fa-solid fa-chevron-down right-icon group-toggle"></i>
                    </div>
                    <div className="nav-subgroup">
                        <button className="nav-subitem border-0 bg-transparent w-full text-left">
                            <i className="fa-solid fa-file-invoice-dollar" style={{ width: '16px', marginRight: '8px' }}></i>
                            <span>Purchase Bills</span>
                        </button>
                        <button className="nav-subitem border-0 bg-transparent w-full text-left">
                            <i className="fa-solid fa-money-bill-trend-up" style={{ width: '16px', marginRight: '8px' }}></i>
                            <span>Payment-Out</span>
                        </button>
                        <button className="nav-subitem border-0 bg-transparent w-full text-left">
                            <i className="fa-solid fa-receipt" style={{ width: '16px', marginRight: '8px' }}></i>
                            <span>Expenses</span>
                        </button>
                    </div>
                </div>

                <div className="nav-group">
                    <div className="nav-item group-header">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                        <span>Grow Your Business</span>
                        <i className="fa-solid fa-chevron-down right-icon group-toggle"></i>
                    </div>
                    <div className="nav-subgroup">
                        <button 
                            className={`nav-subitem ${currentView === 'REPORTS' ? 'active' : ''} border-0 bg-transparent w-full text-left`}
                            onClick={() => setCurrentView('REPORTS')}
                        >
                            <i className="fa-solid fa-chart-pie" style={{ width: '16px', marginRight: '8px' }}></i>
                            <span>Reports</span>
                        </button>
                        <button className="nav-subitem border-0 bg-transparent w-full text-left">
                            <i className="fa-solid fa-building-columns" style={{ width: '16px', marginRight: '8px' }}></i>
                            <span>Cash & Bank</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="sidebar-footer" onClick={() => setCurrentView('PROFILE_EDIT')}>
                <div className="company-logo">{companyData.name.charAt(0).toUpperCase()}</div>
                <div className="company-name">My Company</div>
            </div>
        </aside>
    );
}
