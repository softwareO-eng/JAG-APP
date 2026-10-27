const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /if \(saleId && saleId !== ''\) \{[\s\S]*?setPaymentInSale\(null\);/m;

const replacement = `const txnId = Date.now().toString();
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
            .filter(t => String(t.partyId) === String(finalPartyId) && t.status !== 'Closed' && t.balance > 0)
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

      setPaymentInSale(null);`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
