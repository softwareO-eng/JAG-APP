import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { View, Estimate, CompanyData, Party, InventoryItem } from './types';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { HomeModule } from './HomeModule';
import { DashboardModule } from './DashboardModule';
import { ReportsModule } from './ReportsModule';
import { EstimatesModule } from './EstimatesModule';
import { PartiesModule } from './PartiesModule';
import { ItemsModule } from './ItemsModule';
import { InvoiceView } from './InvoiceView';
import { ReceiptView } from './ReceiptView';
import { InvoiceForm } from './InvoiceForm';
import { PartyFormModal } from './PartyFormModal';
import { ItemFormModal } from './ItemFormModal';
import { SettingsModule } from './SettingsModule';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { PaymentInModal } from './PaymentInModal';
import { PaymentInModule } from './PaymentInModule';
import { 
  getAuthService, getDatabaseService, googleProvider, 
  handleFirestoreError, OperationType, 
  testConnection 
} from './firebase';
import { 
  signInWithPopup, signInAnonymously, onAuthStateChanged, User, signOut 
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, getDocs, 
  collection, query, where, onSnapshot, 
  writeBatch, deleteDoc, updateDoc 
} from 'firebase/firestore';
import { RefreshCw, FileDown, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function App() {
  const auth = getAuthService();
  const db = getDatabaseService();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataSyncing, setDataSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [currentInvoice, setCurrentInvoice] = useState<Estimate | null>(null);
  const [isAutoSharing, setIsAutoSharing] = useState(false);
  const [paymentInSale, setPaymentInSale] = useState<Estimate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    terms: ''
  });

  const [sales, setSales] = useState<Estimate[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);

  const [convertingEstimateId, setConvertingEstimateId] = useState<string | null>(null);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [editingParty, setEditingParty] = useState<Partial<Party> | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);

  // Initialize Firebase Connection test
  useEffect(() => {
    testConnection();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setAuthLoading(false);
      } else {
        // Sign in anonymously so everyone can access shared Firestore database
        signInAnonymously(auth).catch((error) => console.error("Anonymous auth failed", error));
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync data with Firestore
  useEffect(() => {
    if (!user) {
      // Load local data if no user
      const savedSales = localStorage.getItem('jag_sales');
      const savedEstimates = localStorage.getItem('jag_estimates');
      const savedParties = localStorage.getItem('jag_parties');
      const savedItems = localStorage.getItem('jag_items');
      const savedCompany = localStorage.getItem('jag_company');

      if (savedSales) setSales(JSON.parse(savedSales));
      if (savedEstimates) setEstimates(JSON.parse(savedEstimates));
      if (savedParties) setParties(JSON.parse(savedParties));
      if (savedItems) setItems(JSON.parse(savedItems));
      if (savedCompany) setCompanyData(JSON.parse(savedCompany));
      
      return;
    };

    // Check for local data migration on first sync
    const hasLocalData = localStorage.getItem('vyapar_company') || 
                        localStorage.getItem('vyapar_sales') || 
                        localStorage.getItem('vyapar_items');
    
    if (hasLocalData) {
      console.log("Local data found, initiating silent migration...");
      migrateToCloud();
    }

    // Subscribe to collections
    setDataSyncing(true);
    
    // 1. Shared Business Profile
    const companyProfileRef = doc(db, 'settings', 'company');
    const unsubCompanyProfile = onSnapshot(companyProfileRef, async (snap) => {
      if (snap.exists()) {
        setCompanyData(snap.data() as CompanyData);
      } else {
        // Initialize shared profile if it doesn't exist
        await setDoc(companyProfileRef, companyData);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/company'));

    // 2. Shared Parties
    const unsubParties = onSnapshot(collection(db, 'parties'), (snap) => {
      setParties(snap.docs.map(d => ({ ...d.data(), id: d.id }) as Party));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'parties'));

    // 3. Shared Items
    const unsubItems = onSnapshot(collection(db, 'inventory'), (snap) => {
      setItems(snap.docs.map(d => ({ ...d.data(), id: d.id }) as InventoryItem));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inventory'));

    // 4. Shared Transactions
    const unsubTxns = onSnapshot(collection(db, 'transactions'), (snap) => {
      const allTxns = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Estimate)
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return (Number(b.refNo) || 0) - (Number(a.refNo) || 0);
        });
      setSales(allTxns.filter(t => t.isSale));
      setEstimates(allTxns.filter(t => !t.isSale));
      setDataSyncing(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));

    return () => {
      unsubCompanyProfile();
      unsubParties();
      unsubItems();
      unsubTxns();
    };
  }, [user]);

  // Persist local data if no user
  useEffect(() => {
    if (user) return;
    localStorage.setItem('jag_sales', JSON.stringify(sales));
    localStorage.setItem('jag_estimates', JSON.stringify(estimates));
    localStorage.setItem('jag_parties', JSON.stringify(parties));
    localStorage.setItem('jag_items', JSON.stringify(items));
    localStorage.setItem('jag_company', JSON.stringify(companyData));
  }, [sales, estimates, parties, items, companyData, user]);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Sign in failed", error);
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError(`Domain ${window.location.hostname} is not authorized. Please add it to Firebase Console.`);
      } else {
        setAuthError(`Sign-in failed: ${error.message}`);
      }
    }
  };

  const handleSignOut = () => signOut(auth);

  const migrateToCloud = async () => {
    if (!user) return;
    setDataSyncing(true);
    try {
      const batch = writeBatch(db);
      
      // Migrate Company
      batch.set(doc(db, 'settings', 'company'), companyData);

      // Migrate Parties
      const savedParties = localStorage.getItem('vyapar_parties');
      if (savedParties) {
        const pList = JSON.parse(savedParties) as Party[];
        pList.forEach(p => {
          const ref = doc(db, 'parties', String(p.id!));
          batch.set(ref, p);
        });
      }

      // Migrate Items
      const savedItems = localStorage.getItem('vyapar_items');
      if (savedItems) {
        const iList = JSON.parse(savedItems) as InventoryItem[];
        iList.forEach(i => {
          const ref = doc(db, 'inventory', String(i.id!));
          batch.set(ref, i);
        });
      }

      // Migrate Sales
      const savedSales = localStorage.getItem('vyapar_sales');
      if (savedSales) {
        const sList = JSON.parse(savedSales) as Estimate[];
        sList.forEach(s => {
          const ref = doc(db, 'transactions', s.id);
          batch.set(ref, { ...s, isSale: true });
        });
      }

      // Migrate Estimates
      const savedEstimates = localStorage.getItem('vyapar_estimates');
      if (savedEstimates) {
        const eList = JSON.parse(savedEstimates) as Estimate[];
        eList.forEach(e => {
          const ref = doc(db, 'transactions', e.id);
          batch.set(ref, { ...e, isSale: false });
        });
      }

      await batch.commit();
      console.log("Migration successful");
      localStorage.clear();
    } catch (error: any) {
      console.error("Migration failed detailed error:", error);
    } finally {
      setDataSyncing(false);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Sales Sheet
    const salesData = sales.map(s => ({
        'Ref No': s.refNo,
        'Type': s.isSale ? 'Sale' : 'Estimate',
        'Date': s.date,
        'Customer': s.customerName,
        'Phone': s.customerPhone || '',
        'Total Amount': s.totalAmount,
        'Amount Received': s.amountReceived,
        'Balance Due': s.totalAmount - s.amountReceived,
        'Status': s.status
    }));
    const wsSales = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, wsSales, "Transactions");

    // Parties Sheet
    const partiesData = parties.map(p => ({
        'Name': p.name,
        'Phone': p.phone,
        'Email': p.email || '',
        'Address': p.billingAddress || '',
        'Balance': p.balance,
        'Type': p.type
    }));
    const wsParties = XLSX.utils.json_to_sheet(partiesData);
    XLSX.utils.book_append_sheet(wb, wsParties, "Parties");

    // Inventory Sheet
    const inventoryData = items.map(i => ({
        'Item Name': i.name,
        'Stock': i.stock,
        'Unit': i.unit,
        'Sale Price': i.price,
        'Purchase Price': i.purchasePrice || 0,
        'Category': i.category || ''
    }));
    const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(wb, wsInventory, "Inventory");

    XLSX.writeFile(wb, `BusinessData_${companyData.name || 'Export'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleAction = (action: string) => {
    if (action === 'ADD_SALE') setCurrentView('SALE_FORM');
    if (action === 'ADD_ESTIMATE') setCurrentView('ESTIMATE_FORM');
    if (action === 'ADD_PARTY') {
        const nextRef = (parties || []).reduce((max, p) => {
          const val = parseInt(String(p?.customerRefNo || 0), 10);
          return isNaN(val) ? max : Math.max(max, val);
        }, 0) + 1;
        setEditingParty({ customerRefNo: isNaN(nextRef) ? 1 : nextRef });
        setShowPartyModal(true);
    };
    if (action === 'ADD_ITEM') {
        setEditingItem({});
        setShowItemModal(true);
    };
    if (action === 'PROFILE_EDIT') setCurrentView('PROFILE_EDIT');
  };

  const handleEditParty = (party: Party) => {
    setEditingParty(party);
    setShowPartyModal(true);
  };

  const handleSaveParty = async (partyData: Partial<Party>) => {
    if (user) {
      try {
        if (partyData.id) {
          const ref = doc(db, 'parties', partyData.id as string);
          await updateDoc(ref, { ...partyData });
        } else {
          const ref = doc(collection(db, 'parties'));
          await setDoc(ref, { 
            ...partyData, 
            customerRefNo: Number(partyData.customerRefNo) || (parties || []).reduce((max, p) => {
              const val = parseInt(String(p?.customerRefNo || 0), 10);
              return isNaN(val) ? max : Math.max(max, val);
            }, 0) + 1,
            id: ref.id, 
            balance: partyData.balance || 0,
            type: 'receive'
          });
        }
      } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'parties'); }
    } else {
      // Local fallback
      if (partyData.id) {
          setParties(prev => prev.map(p => p.id === partyData.id ? { ...p, ...partyData as Party } : p));
      } else {
          const newParty: Party = {
              ...partyData as Party,
              customerRefNo: Number(partyData.customerRefNo) || parties.reduce((max, p) => {
                const val = Number(p.customerRefNo);
                return isNaN(val) ? max : Math.max(max, val);
              }, 0) + 1,
              id: Date.now().toString(),
              balance: partyData.balance || 0,
              type: 'receive'
          };
          setParties([...parties, newParty]);
      }
    }
    setShowPartyModal(false);
    setEditingParty(null);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleSaveItem = async (itemData: Partial<InventoryItem>) => {
    if (user) {
      try {
        if (itemData.id) {
          await updateDoc(doc(db, 'inventory', itemData.id as string), { ...itemData });
        } else {
          const ref = doc(collection(db, 'inventory'));
          await setDoc(ref, { 
            ...itemData, 
            id: ref.id, 
            stock: itemData.stock || 0,
            minStock: itemData.minStock || 0
          });
        }
      } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'inventory'); }
    } else {
      if (itemData.id) {
          setItems(prev => prev.map(i => i.id === itemData.id ? { ...i, ...itemData as InventoryItem } : i));
      } else {
          const newItem: InventoryItem = {
              ...itemData as InventoryItem,
              id: Date.now().toString(),
              stock: itemData.stock || 0,
              minStock: itemData.minStock || 0
          };
          setItems([...items, newItem]);
      }
    }
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleConvertToSale = async (estimateId: string, type: 'SALE' | 'SALE_ORDER') => {
    // Both SALE and SALE_ORDER conversions should open the Sale Form with estimate data
    setConvertingEstimateId(estimateId);
    setCurrentView('SALE_FORM');
    
    // Optionally mark it as closed if it's a one-way conversion, 
    // but typically we wait for the sale to be saved.
    // However, the original code for SALE_ORDER was closing it immediately.
    // Let's stick to opening the form for both as requested.
  };

  const [editingInvoice, setEditingInvoice] = useState<Estimate | null>(null);

  const handleEditSale = (inv: Estimate) => {
    setEditingInvoice(inv);
    setCurrentView(inv.isSale ? 'SALE_FORM' : 'ESTIMATE_FORM');
  };

  const [deleteAction, setDeleteAction] = useState<{type: 'transaction'|'party'|'item', id: string, name?: string} | null>(null);

  const handleDeleteSale = async (id: string) => {
    setDeleteAction({ type: 'transaction', id });
  };

  const handleSavePaymentIn = async (
    saleId: string | null, 
    amount: number, 
    paymentType: 'Cash' | 'Cheque' | 'Online', 
    newPartyBalance: number,
    partyDataInput?: { name: string, id?: string | number },
    date?: string,
    refNo?: number,
    description?: string,
    viewReceipt?: boolean
  ) => {
    let finalPartyId = partyDataInput?.id;
    let finalPartyName = (partyDataInput?.name || 'Customer').trim();
    let finalPartyRefNo = parties.find(p => p.id === finalPartyId)?.customerRefNo;

    // 1. Ensure party exists
    const allTransactions = [...sales, ...estimates];
    const receiptsCount = sales.filter(t => t.txnType === 'Payment-In').length;
    const finalRefNo = refNo && refNo !== 0 ? refNo : Math.max(receiptsCount, ...allTransactions.filter(t => t.txnType === 'Payment-In').map(t => Number(t.refNo) || 0)) + 1;

    if (finalPartyName && !finalPartyId) {
       const existingParty = parties.find(p => p.name && p.name.toLowerCase() === finalPartyName.toLowerCase().trim());
       if (existingParty) {
          finalPartyId = existingParty.id;
          finalPartyName = existingParty.name;
          finalPartyRefNo = existingParty.customerRefNo;
       } else if (user) {
          const nextRef = parties.reduce((max, p) => {
            const val = Number(p.customerRefNo);
            return isNaN(val) ? max : Math.max(max, val);
          }, 0) + 1;
          const partyRef = doc(collection(db, 'parties'));
          await setDoc(partyRef, {
             id: partyRef.id,
             name: finalPartyName,
             phone: '',
             email: '',
             billingAddress: '',
             customerRefNo: nextRef,
             balance: -amount,
             type: 'receive'
          });
          finalPartyId = partyRef.id;
          finalPartyRefNo = nextRef;
       } else {
          const nextRef = parties.reduce((max, p) => {
            const val = Number(p.customerRefNo);
            return isNaN(val) ? max : Math.max(max, val);
          }, 0) + 1;
          const newId = Date.now().toString();
          const newParty: Party = {
             id: newId,
             name: finalPartyName,
             customerRefNo: nextRef,
             balance: -amount,
             type: 'receive',
             phone: '',
             email: '',
             billingAddress: ''
          };
          finalPartyId = newId;
          finalPartyRefNo = nextRef;
          setParties(prev => [...prev, newParty]);
       }
    }

    const txnId = Date.now().toString();
      const newPayment: Estimate = {
        id: txnId,
        refNo: finalRefNo,
        date: date || new Date().toISOString().split('T')[0],
        customerName: finalPartyName,
        partyId: finalPartyId ?? null,
        customerRefNo: typeof finalPartyRefNo === 'number' ? finalPartyRefNo : null,
        items: [],
        totalAmount: 0,
        receivedAmount: amount,
        balance: 0,
        isSale: true,
        paymentType: paymentType,
        status: 'Closed',
        discountValue: 0,
        discountType: 'fixed',
        taxType: 'none',
        description: description || 'Payment-In received',
        txnType: 'Payment-In'
      };

      const updatedTxns: Estimate[] = [];
      if (saleId && saleId !== '') {
          const isSale = !!sales.find(s => s.id === saleId);
          const saleList = isSale ? sales : estimates;
          const sale = saleList.find(s => s.id === saleId);
          if (sale) {
              const newReceived = (sale.receivedAmount || 0) + amount;
              const newBalance = sale.totalAmount - newReceived;
              updatedTxns.push({
                  ...sale,
                  receivedAmount: newReceived,
                  balance: newBalance,
                  paymentType: paymentType,
                  status: (newBalance <= 0) ? 'Closed' : sale.status
              });
          }
      } else if (finalPartyId) {
          let remaining = amount;
          const openTxns = [...estimates, ...sales]
            .filter(t => {
              if (String(t.partyId) !== String(finalPartyId) || t.status === 'Closed' || t.balance <= 0) return false;
              // If it's an estimate, check if it was converted to a sale. If so, don't apply bulk payment to it.
              if (!t.isSale && sales.some(s => s.convertedFromId === t.id)) return false;
              return true;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          for (const txn of openTxns) {
              if (remaining <= 0) break;
              const apply = Math.min(remaining, txn.balance);
              const newRec = (txn.receivedAmount || 0) + apply;
              const newBal = txn.totalAmount - newRec;
              updatedTxns.push({
                  ...txn,
                  receivedAmount: newRec,
                  balance: newBal,
                  status: (newBal <= 0) ? 'Closed' : txn.status
              });
              remaining -= apply;
          }
      }

      if (user) {
        try {
          if (viewReceipt) {
              setCurrentInvoice(newPayment);
              setCurrentView('RECEIPT_VIEW');
          } else {
              setCurrentView('PAYMENT_IN_LIST');
          }
          const batch = writeBatch(db);
          const txnRef = doc(collection(db, 'transactions'));
          newPayment.id = txnRef.id;
          batch.set(txnRef, newPayment);
          
          updatedTxns.forEach(ut => {
              batch.set(doc(db, 'transactions', ut.id), ut);
          });

          if (finalPartyId) {
             const isNewParty = parties.findIndex(p => String(p.id) === String(finalPartyId)) === -1;
             if (!isNewParty) {
                batch.set(doc(db, 'parties', String(finalPartyId)), { balance: newPartyBalance }, { merge: true });
             }
          }
          await batch.commit();
          console.log("Payment recorded successfully!");
        } catch (err) { 
            handleFirestoreError(err, OperationType.WRITE, 'transactions'); 
            console.log("Failed to record payment.");
        }
      } else {
        setSales(prev => {
            const updatedSales = [...prev];
            updatedTxns.filter(t => t.isSale).forEach(ut => {
                const idx = updatedSales.findIndex(s => s.id === ut.id);
                if (idx !== -1) updatedSales[idx] = ut;
            });
            return [...updatedSales, newPayment];
        });
        setEstimates(prev => {
            const updatedEsts = [...prev];
            updatedTxns.filter(t => !t.isSale).forEach(ut => {
                const idx = updatedEsts.findIndex(s => s.id === ut.id);
                if (idx !== -1) updatedEsts[idx] = ut;
            });
            return updatedEsts;
        });
        if (finalPartyId) {
          setParties(prev => prev.map(p => String(p.id) === String(finalPartyId) ? { ...p, balance: newPartyBalance } as Party : p));
        }
        console.log("Payment recorded locally.");
        if (viewReceipt) {
            setCurrentInvoice(newPayment);
            setCurrentView('RECEIPT_VIEW');
        } else {
            setCurrentView('PAYMENT_IN_LIST');
        }
      }

      setPaymentInSale(null);
  };

  const executeDelete = async () => {
    if (!deleteAction) return;
    const { type, id } = deleteAction;

    if (type === 'transaction') {
      if (user) {
        deleteDoc(doc(db, 'transactions', id)).catch((err) => {
          console.error("Delete failed:", err);
          handleFirestoreError(err, OperationType.DELETE, `transactions/${id}`);
        });
      } else {
        setSales(prev => prev.filter(s => s.id !== id));
        setEstimates(prev => prev.filter(e => e.id !== id));
      }
    } else if (type === 'party') {
      if (user) {
        deleteDoc(doc(db, 'parties', id)).catch((err) => handleFirestoreError(err, OperationType.DELETE, `parties/${id}`));
      } else {
        setParties(prev => prev.filter(p => p.id !== id));
      }
      setShowPartyModal(false);
      setEditingParty(null);
    } else if (type === 'item') {
      if (user) {
        deleteDoc(doc(db, 'inventory', id)).catch((err) => handleFirestoreError(err, OperationType.DELETE, `inventory/${id}`));
      } else {
        setItems(prev => prev.filter(i => i.id !== id));
      }
      setShowItemModal(false);
      setEditingItem(null);
    }

    setDeleteAction(null);
  };

  const handleDeleteItem = (id: string | number) => {
    setDeleteAction({ type: 'item', id: String(id) });
  };

  const handleDeleteParty = (id: string | number) => {
    setDeleteAction({ type: 'party', id: String(id) });
  };

  const handleDeleteAllParties = async () => {
    const confirm = window.confirm("Are you sure you want to delete ALL parties? This action cannot be undone.");
    if (!confirm) return;

    if (user) {
      try {
        const batch = writeBatch(db);
        if (parties.length === 0) {
          alert("No parties to delete.");
          return;
        }
        parties.forEach(p => {
          batch.delete(doc(db, 'parties', String(p.id)));
        });
        await batch.commit();
        alert("All parties deleted successfully.");
      } catch (err) { 
        handleFirestoreError(err, OperationType.DELETE, 'parties (all)'); 
        alert("Failed to delete parties. Check console for details.");
      }
    } else {
      setParties([]);
      alert("Local parties cleared.");
    }
  };

  const handleDeleteAllTransactions = async () => {
    const confirm = window.confirm("Are you sure you want to delete ALL transactions (Sales & Estimates)? This action cannot be undone.");
    if (!confirm) return;

    const allTxns = [...sales, ...estimates];
    if (user) {
      try {
        if (allTxns.length === 0) {
          alert("No transactions to delete.");
          return;
        }
        const batch = writeBatch(db);
        allTxns.forEach(t => {
          batch.delete(doc(db, 'transactions', t.id));
        });
        await batch.commit();
        alert("All transactions deleted successfully.");
      } catch (err) { 
        handleFirestoreError(err, OperationType.DELETE, 'transactions (all)'); 
        alert("Failed to delete transactions.");
      }
    } else {
      setSales([]);
      setEstimates([]);
      alert("Local transactions cleared.");
    }
  };

  const handleDeleteAllItems = async () => {
    const confirm = window.confirm("Are you sure you want to delete ALL inventory items? This action cannot be undone.");
    if (!confirm) return;

    if (user) {
      try {
        if (items.length === 0) {
          alert("No items to delete.");
          return;
        }
        const batch = writeBatch(db);
        items.forEach(i => {
          batch.delete(doc(db, 'inventory', String(i.id)));
        });
        await batch.commit();
        alert("All items deleted successfully.");
      } catch (err) { 
        handleFirestoreError(err, OperationType.DELETE, 'inventory (all)'); 
        alert("Failed to delete items.");
      }
    } else {
      setItems([]);
      alert("Local items cleared.");
    }
  };

  const handleEditEstimate = (est: Estimate) => {
    setEditingInvoice(est);
    setCurrentView('ESTIMATE_FORM');
  };

  const handleViewInvoice = (inv: Estimate, autoShare: boolean = false) => {
    setIsAutoSharing(autoShare);
    // If it's a closed estimate, try to find the sale it was converted to
    if (!inv.isSale && inv.status === 'Closed') {
      const associatedSale = sales.find(s => s.convertedFromId === inv.id);
      if (associatedSale) {
        setCurrentInvoice(associatedSale);
        setCurrentView('INVOICE_VIEW');
        return;
      }
    }
    setCurrentInvoice(inv);
    setCurrentView('INVOICE_VIEW');
  };

  const handleViewReceipt = (inv: Estimate, autoShare: boolean = false) => {
    setIsAutoSharing(autoShare);
    setCurrentInvoice(inv);
    setCurrentView('RECEIPT_VIEW');
  };

  const handleSaveInvoice = async (inv: Estimate, isSale: boolean, printAndPreview: boolean) => {
      inv.isSale = isSale;
      if (printAndPreview) {
          setCurrentInvoice(inv);
          setCurrentView('INVOICE_VIEW');
      } else {
          setCurrentView(isSale ? 'SALE_LIST' : 'ESTIMATE_LIST');
      }

      if (user) {
        try {
          const batch = writeBatch(db);

          // 1. Party management
          if (inv.customerName) {
            const trimmedName = inv.customerName.trim();
            const party = parties.find(p => p.name && p.name.toLowerCase().trim() === trimmedName.toLowerCase());
            
            if (party) {
              inv.customerRefNo = party.customerRefNo;
              inv.partyId = party.id;
              inv.customerPhone = inv.customerPhone || party.phone;
              inv.billingAddress = inv.billingAddress || party.billingAddress;
              
              if (isSale) {
                let delta = inv.totalAmount;
                if (editingInvoice) {
                  delta = inv.totalAmount - editingInvoice.totalAmount;
                }
                batch.update(doc(db, 'parties', party.id as string), {
                  balance: (party.balance || 0) + delta
                });
              }
            } else {
              const nextRef = (parties || []).reduce((max, p) => {
                const val = parseInt(String(p?.customerRefNo || 0), 10);
                return isNaN(val) ? max : Math.max(max, val);
              }, 0) + 1;
              const partyRef = doc(collection(db, 'parties'));
              const newParty = {
                id: partyRef.id,
                name: trimmedName,
                phone: inv.customerPhone || '',
                email: '',
                billingAddress: inv.billingAddress || '',
                customerRefNo: isNaN(nextRef) ? 1 : nextRef,
                balance: isSale ? inv.totalAmount : 0,
                type: 'receive'
              };
              batch.set(partyRef, newParty);
              inv.partyId = partyRef.id;
              inv.customerRefNo = isNaN(nextRef) ? 1 : nextRef;
            }
          }

          // 2. Transaction save
          if (editingInvoice) {
            batch.update(doc(db, 'transactions', editingInvoice.id), { ...inv });
            setEditingInvoice(null);
          } else {
            if (isSale && convertingEstimateId) {
              inv.convertedFromId = convertingEstimateId;
              const newBalance = inv.totalAmount - inv.receivedAmount;
              batch.update(doc(db, 'transactions', convertingEstimateId), { 
                status: newBalance <= 0 ? 'Closed' : 'Open',
                receivedAmount: inv.receivedAmount,
                balance: newBalance
              });
              setConvertingEstimateId(null);
            }
            const txnRef = doc(collection(db, 'transactions'));
            inv.id = txnRef.id;
            batch.set(txnRef, inv);
          }

          await batch.commit();
        } catch (err) { 
          console.error("Save Invoice Error:", err);
          handleFirestoreError(err, OperationType.WRITE, 'transactions'); 
        }
      } else {
        // LOCAL FALLBACK
        // ... (existing local logic)
        if (editingInvoice) {
            if (isSale) {
                setSales(prev => prev.map(s => s.id === editingInvoice.id ? { ...inv, id: editingInvoice.id } : s));
            } else {
                setEstimates(prev => prev.map(e => e.id === editingInvoice.id ? { ...inv, id: editingInvoice.id } : e));
            }
            setEditingInvoice(null);
        } else {
            if (isSale && convertingEstimateId) {
                inv.convertedFromId = convertingEstimateId;
                const newBalance = inv.totalAmount - inv.receivedAmount;
                setEstimates(prev => prev.map(e => e.id === convertingEstimateId ? { 
                    ...e, 
                    status: newBalance <= 0 ? 'Closed' : 'Open',
                    receivedAmount: inv.receivedAmount,
                    balance: newBalance
                } : e));
                setConvertingEstimateId(null);
            }
            
            if (inv.customerName) {
                let updatedParties = [...parties];
                let partyIndex = updatedParties.findIndex(p => p.name && p.name.toLowerCase().trim() === (inv.customerName || '').toLowerCase().trim());
                if (partyIndex >= 0) {
                    const party = updatedParties[partyIndex];
                    inv.customerRefNo = party.customerRefNo;
                    if (isSale) updatedParties[partyIndex] = { ...party, balance: (party.balance || 0) + inv.totalAmount };
                } else {
                  const nextRef = (parties || []).reduce((max, p) => {
                    const val = parseInt(String(p?.customerRefNo || 0), 10);
                    return isNaN(val) ? max : Math.max(max, val);
                  }, 0) + 1;
                  const safeNextRef = isNaN(nextRef) ? 1 : nextRef;
                  const newParty: Party = { id: Date.now().toString() + "_party", name: inv.customerName.trim(), phone: inv.customerPhone || '', email: '', billingAddress: inv.billingAddress || '', customerRefNo: safeNextRef, balance: isSale ? inv.totalAmount : 0, type: 'receive' };
                  updatedParties.push(newParty);
                  inv.partyId = newParty.id;
                  inv.customerRefNo = safeNextRef;
                }
                setParties(updatedParties);
            }
            
            if (isSale) setSales([...sales, inv]);
            else setEstimates([...estimates, inv]);
        }
      }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <RefreshCw size={40} className="text-indigo-600 animate-spin" />
      </div>
    );
  }

  const handleUpdateCompanyData = async (newData: CompanyData) => {
    if (user) {
      try {
        await setDoc(doc(db, 'settings', 'company'), newData, { merge: true });
      } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'settings/company'); }
    } else {
      setCompanyData(newData);
    }
  };

  const maxRefNo = Math.max(...[...sales, ...estimates].map(s => Number(s.refNo || 0)), 0);

  return (
    <div id="app-container">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onAction={handleAction} 
        companyData={companyData} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main id="main-content">
        
        <div id="module-container">
          {currentView === 'HOME' && (
            <DashboardModule 
              sales={[...sales, ...estimates]}
              parties={parties}
              items={items}
              onNavigate={setCurrentView} 
              onEditSale={handleEditSale}
              onDeleteSale={handleDeleteSale}
              onViewSale={handleViewInvoice}
              onViewReceipt={handleViewReceipt}
              onConvertToSale={handleConvertToSale}
              onPaymentIn={(sale) => {
                 setPaymentInSale(sale);
                 setCurrentView('PAYMENT_IN_FORM');
              }}
            />
          )}
          {currentView === 'REPORTS' && <ReportsModule sales={sales} parties={parties} items={items} onNavigate={setCurrentView} onExportExcel={exportToExcel} />}
          {currentView === 'SALE_LIST' && (
            <HomeModule 
              sales={sales.filter(s => (s.customerName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || String(s.refNo).includes(searchQuery))} 
              onAddSale={() => setCurrentView('SALE_FORM')} 
              onEditSale={handleEditSale} 
              onViewSale={handleViewInvoice} 
              onDeleteSale={handleDeleteSale}
              onPaymentIn={(sale) => {
                  setPaymentInSale(sale);
                  setCurrentView('PAYMENT_IN_FORM');
              }}
            />
          )}
          {currentView === 'PAYMENT_IN_LIST' && (
            <PaymentInModule 
              sales={sales} 
              onViewSale={handleViewInvoice}
              onViewReceipt={handleViewReceipt}
              onDelete={handleDeleteSale}
              onAddPaymentIn={() => {
                  setPaymentInSale(null);
                  setCurrentView('PAYMENT_IN_FORM');
              }}
            />
          )}
          {currentView === 'PAYMENT_IN_FORM' && (
            <PaymentInModal
              parties={parties}
              initialData={paymentInSale || undefined}
              onClose={() => setCurrentView('PAYMENT_IN_LIST')}
              onSave={(data: any, viewReceipt: boolean) => handleSavePaymentIn(
                paymentInSale?.id || null, 
                data.receivedAmount, 
                data.paymentType, 
                (parties.find(p => String(p.id) === String(data.partyId))?.balance || 0) - data.receivedAmount, 
                { id: data.partyId, name: data.customerName }, 
                data.date, 
                paymentInSale?.refNo || 0,
                data.description,
                viewReceipt
              )}
            />
          )}
          {currentView === 'PARTIES_LIST' && (
            <PartiesModule 
              parties={parties} 
              sales={sales} 
              estimates={estimates} 
              onAddParty={() => { 
                const nextRef = (parties || []).reduce((max, p) => {
                  const val = parseInt(String(p?.customerRefNo || 0), 10);
                  return isNaN(val) ? max : Math.max(max, val);
                }, 0) + 1;
                setEditingParty({ customerRefNo: isNaN(nextRef) ? 1 : nextRef }); 
                setShowPartyModal(true); 
              }} 
              onEditParty={handleEditParty}
              onEditSale={handleEditSale}
              onEditEstimate={handleEditEstimate}
              onViewTransaction={handleViewInvoice}
              onViewReceipt={handleViewReceipt}
              onDeleteParty={handleDeleteParty}
              onPaymentIn={(party) => {
                setPaymentInSale({
                  id: '',
                  refNo: 0,
                  date: new Date().toISOString().split('T')[0],
                  customerName: party.name,
                  partyId: String(party.id),
                  customerRefNo: party.customerRefNo,
                  items: [],
                  totalAmount: 0,
                  receivedAmount: 0,
                  balance: 0,
                  isSale: true,
                  status: 'Open',
                  discountValue: 0,
                  discountType: 'fixed',
                  taxType: 'none',
                  description: ''
                });
                setCurrentView('PAYMENT_IN_FORM');
              }}
            />
          )}
          {currentView === 'ITEMS_LIST' && <ItemsModule items={items} onAddItem={() => { setEditingItem({}); setShowItemModal(true); }} onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />}
          {currentView === 'ESTIMATE_LIST' && (
            <EstimatesModule 
              estimates={estimates} 
              onAddEstimate={() => setCurrentView('ESTIMATE_FORM')} 
              onConvertToSale={handleConvertToSale} 
              onEditEstimate={handleEditEstimate} 
              onViewEstimate={handleViewInvoice} 
              onDeleteEstimate={handleDeleteSale}
              onPaymentIn={(est) => {
                setPaymentInSale(est);
                setCurrentView('PAYMENT_IN_FORM');
              }}
            />
          )}
          {currentView === 'SALE_FORM' && <InvoiceForm isSale={true} allTransactions={[...sales, ...estimates]} onSave={(sale) => handleSaveInvoice(sale, true, false)} onCancel={() => { setConvertingEstimateId(null); setEditingInvoice(null); setCurrentView('SALE_LIST'); }} initialData={editingInvoice || (convertingEstimateId ? estimates.find(e => e.id === convertingEstimateId) : undefined)} parties={parties} inventoryItems={items} />}
          {currentView === 'ESTIMATE_FORM' && <InvoiceForm isSale={false} allTransactions={[...sales, ...estimates]} onSave={(est) => handleSaveInvoice(est, false, false)} onCancel={() => { setEditingInvoice(null); setCurrentView('ESTIMATE_LIST'); }} initialData={editingInvoice || undefined} parties={parties} inventoryItems={items} />}
          {currentView === 'INVOICE_VIEW' && currentInvoice && (
             <InvoiceView 
                estimate={currentInvoice} 
                companyData={companyData} 
                setCompanyData={handleUpdateCompanyData} 
                autoShare={isAutoSharing}
                onBack={() => {
                  setCurrentView(currentInvoice.isSale ? 'SALE_LIST' : 'ESTIMATE_LIST');
                  setIsAutoSharing(false);
                }} 
             />
          )}
          {currentView === 'RECEIPT_VIEW' && currentInvoice && (
             <ReceiptView 
                payment={currentInvoice} 
                companyData={companyData} 
                setCompanyData={handleUpdateCompanyData} 
                autoShare={isAutoSharing}
                onBack={() => {
                  setCurrentView('PAYMENT_IN_LIST');
                  setIsAutoSharing(false);
                }} 
                onDelete={handleDeleteSale}
             />
          )}
          {currentView === 'PROFILE_EDIT' && (
             <SettingsModule 
                companyData={companyData} 
                onChange={handleUpdateCompanyData} 
                onBack={() => setCurrentView('HOME')} 
                onDeleteAllParties={handleDeleteAllParties}
                onDeleteAllTransactions={handleDeleteAllTransactions}
                onDeleteAllItems={handleDeleteAllItems}
             />
          )}
        </div>
      </main>

      {showPartyModal && editingParty && (
          <PartyFormModal 
            party={editingParty}
            onSave={handleSaveParty}
            onCancel={() => { setShowPartyModal(false); setEditingParty(null); }}
            onDelete={handleDeleteParty}
          />
      )}
      {showItemModal && editingItem && (
          <ItemFormModal 
            item={editingItem}
            onSave={handleSaveItem}
            onCancel={() => { setShowItemModal(false); setEditingItem(null); }}
            onDelete={handleDeleteItem}
          />
      )}
      {deleteAction && (
        <DeleteConfirmModal
            title={`Delete ${deleteAction.type}`}
            message={`Are you sure you want to delete this ${deleteAction.type}? This action cannot be undone.`}
            onConfirm={executeDelete}
            onCancel={() => setDeleteAction(null)}
        />
      )}
    </div>
  );
}


