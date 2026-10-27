import React, { useState } from 'react';
import { ArrowLeft, Download, Printer, Share2, Check, Monitor, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Estimate, CompanyData } from './types';

export function ReceiptView({
  payment,
  companyData,
  setCompanyData,
  onBack,
  onDelete,
  autoShare = false
}: {
  payment: Estimate;
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  onBack: () => void;
  onDelete?: (id: string) => void;
  autoShare?: boolean;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (autoShare) {
      const timer = setTimeout(() => {
        handleShare();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoShare]);
  
  const generatePDFBlob = async (): Promise<{blob: Blob, fileName: string} | null> => {
    const element = document.getElementById('receipt-paper');
    if (!element) return null;
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const elHeight = element.scrollHeight;
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: elHeight,
        windowWidth: 794,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (doc) => {
          doc.body.style.width = '800px';
          doc.body.style.minWidth = '800px';
          const el = doc.getElementById('receipt-paper');
          if (el) {
            el.style.width = '794px';
            el.style.minWidth = '794px';
            el.style.maxWidth = '794px';
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.left = '0';
            el.style.margin = '0';
            el.style.transform = 'none';
          }
        }
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (elHeight * pdfWidth) / 794;
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const blob = pdf.output('blob');
      
      return {
        blob,
        fileName: `Receipt_${payment.refNo}.pdf`
      };
    } catch (error) {
      console.error('Error in PDF generation:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    const result = await generatePDFBlob();
    if (result) {
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const generateImageBlob = async (): Promise<{blob: Blob, fileName: string} | null> => {
    const element = document.getElementById('receipt-paper');
    if (!element) return null;
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const elHeight = element.scrollHeight;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: elHeight,
        windowWidth: 794,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (doc) => {
          doc.body.style.width = '800px';
          doc.body.style.minWidth = '800px';
          const el = doc.getElementById('receipt-paper');
          if (el) {
            el.style.width = '794px';
            el.style.minWidth = '794px';
            el.style.maxWidth = '794px';
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.left = '0';
            el.style.margin = '0';
            el.style.transform = 'none';
          }
        }
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return { blob, fileName: `Receipt_${payment.refNo}.jpg` };
    } catch (error) {
      console.error('Error in image generation:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (platform?: 'whatsapp' | 'whatsapp-image' | 'email') => {
    let result: {blob: Blob, fileName: string} | null = null;
    
    if (platform === 'whatsapp-image') {
      result = await generateImageBlob();
    } else {
      result = await generatePDFBlob();
    }
    
    if (result) {
      try {
        const file = new File([result.blob], result.fileName, { 
          type: platform === 'whatsapp-image' ? 'image/jpeg' : 'application/pdf' 
        });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: result.fileName,
            text: `Here is your payment receipt from ${companyData.name}`
          });
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('File Share API failed:', err);
      }
    }

    const text = `Payment Receipt from ${companyData.name}\nReceipt No: ${payment.refNo}\nAmount Received: Rs ${payment.receivedAmount}`;
    
    if (platform?.startsWith('whatsapp')) {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`mailto:?subject=Payment Receipt ${payment.refNo}&body=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handlePrint = (type: 'normal' | 'thermal') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptContent = document.getElementById('receipt-paper')?.innerHTML;
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <style>
             ${styles}
             body { background: white !important; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
             #receipt-paper { 
               box-shadow: none !important; 
               border: none !important; 
               width: ${type === 'thermal' ? '72mm' : '210mm'} !important; 
               height: ${type === 'thermal' ? 'auto' : '297mm'} !important;
               max-width: ${type === 'thermal' ? '72mm' : '210mm'} !important; 
               margin: 0 auto !important; 
               transform: none !important;
               background: white !important;
               color: black !important;
               padding: ${type === 'thermal' ? '10px' : '15mm'} !important;
               box-sizing: border-box !important;
             }
             @page { 
               margin: 0; 
               size: ${type === 'thermal' ? '80mm auto' : 'A4'}; 
             }
          </style>
        </head>
        <body>
          <div id="receipt-paper">
            ${receiptContent}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  function numberToWords(num: number): string {
    if (num === 0) return 'Zero';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const inWords = (n: number): string => {
      if ((n = Math.floor(n)) === 0) return '';
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
    };
    return inWords(num).trim() + ' Rupees only';
  }

  return (
    <div className="flex-1 bg-slate-100 overflow-y-auto relative">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 pb-20 flex flex-col gap-8">
        
        <div className="w-full">
            <div className="flex items-center justify-between mb-6 print:hidden bg-transparent">
              <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 bg-white hover:bg-slate-50 rounded shadow-sm transition-colors border border-slate-200 text-slate-600">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="font-bold text-slate-800 text-xl">Receipt Preview</h2>
              </div>
              <div className="flex gap-4 items-center">
                 <button 
                   onClick={() => onDelete && onDelete(payment.id)} 
                   className="p-2 bg-white hover:bg-red-50 text-red-600 rounded shadow-sm border border-slate-200 transition-colors"
                   title="Delete Receipt"
                 >
                   <Trash2 size={20} />
                 </button>
                 <button 
                   onClick={() => handleShare()} 
                   disabled={isGenerating}
                   className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded shadow-sm border border-slate-200 transition-colors"
                   title="Share Receipt"
                 >
                   <Share2 size={20} />
                 </button>
                 <button 
                   onClick={handleDownloadPDF} 
                   disabled={isGenerating}
                   className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isGenerating ? (
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : <Download size={16} />}
                   {isGenerating ? 'Generating...' : 'Download PDF'}
                 </button>
                 <button onClick={onBack} className="text-emerald-600 hover:text-emerald-700 font-semibold underline text-sm">Save & Close</button>
              </div>
            </div>

            <div id="receipt-paper" className="bg-white border border-slate-200 shadow-xl p-0 print:shadow-none print:border-none print:p-0 relative w-[794px] mx-auto text-black font-sans leading-snug flex flex-col">
          <style dangerouslySetInnerHTML={{__html: `
            #receipt-paper * { box-sizing: border-box; }
            #receipt-paper { padding: 40px !important; }
          `}} />
          
          <h2 style={{ textAlign: 'center', color: '#000', fontSize: '24px', fontWeight: 'bold', margin: '0', textTransform: 'uppercase' }}>
            Payment
          </h2>
          <h2 style={{ textAlign: 'center', color: '#000', fontSize: '24px', fontWeight: 'bold', margin: '0 0 30px 0', textTransform: 'uppercase' }}>
            Receipt
          </h2>

          <div style={{ border: '1px solid #000', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ display: 'flex', padding: '15px', borderBottom: '1px solid #000', alignItems: 'center' }}>
               <div style={{ width: '90px', height: '90px', border: '1px solid #000', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff' }}>
                  {companyData.logo ? (
                     <img src={companyData.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                     <div style={{ color: '#000', fontWeight: '900', fontSize: '28px', border: '3px solid #000', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>JAG</div>
                  )}
               </div>
               <div style={{ flex: 1 }}>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#000', fontWeight: 'bold' }}>{companyData.name || ' Jawad Aluminium and Glass Works'}</h1>
                  <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#000', fontWeight: '500' }}>{companyData.address || 'Shop#1 Habib Plaza Near River Bridge Main Double Road Phase 5 Ghouri Town Islamabad'}</p>
                  <div style={{ display: 'flex', fontSize: '11px', color: '#000', gap: '30px' }}>
                     <div>Phone: <b style={{ fontWeight: 'bold' }}>{companyData.phone || '03235528196'}</b></div>
                     <div>Email: <b style={{ fontWeight: 'bold' }}>{companyData.email || 'jawadaluminium786@gmail.com'}</b></div>
                  </div>
               </div>
            </div>
 
            <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
               <div style={{ flex: 1, borderRight: '1px solid #000', minHeight: '60px' }}>
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '10px', fontWeight: 'bold', background: '#f8fafc', color: '#000' }}>Received From:</div>
                  <div style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 'bold' }}>
                    {payment.customerName}
                  </div>
               </div>
               <div style={{ width: '300px' }}>
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '10px', fontWeight: 'bold', background: '#f8fafc', color: '#000' }}>Receipt Details:</div>
                  <div style={{ padding: '8px 10px', fontSize: '11px', color: '#000', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex' }}><span style={{ width: '80px' }}>No:</span> <b style={{ fontWeight: 'bold' }}>{payment.refNo}</b></div>
                    <div style={{ display: 'flex' }}><span style={{ width: '80px' }}>Date:</span> <b style={{ fontWeight: 'bold' }}>{payment.date}</b></div>
                  </div>
               </div>
            </div>
  
            <div style={{ display: 'flex', flex: 1 }}>
               <div style={{ flex: 1, borderRight: '1px solid #000' }}></div>
               <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ borderBottom: '1px solid #000', padding: '6px 10px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', width: '120px' }}>Received</span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', marginRight: '30px' }}>:</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Rs {(payment.receivedAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div style={{ borderBottom: '1px solid #000', padding: '6px 10px', background: '#f8fafc', fontSize: '10px', fontWeight: 'bold' }}>
                    Amount In Words :
                  </div>
                  <div style={{ borderBottom: '1px solid #000', padding: '8px 10px', fontSize: '11px', color: '#000', minHeight: '40px' }}>
                    {numberToWords(payment.receivedAmount || 0)}
                  </div>
                  
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '10px', fontWeight: 'bold', background: '#f8fafc' }}>
                    For {companyData.name || 'Business Name'}:
                  </div>
                  <div style={{ padding: '10px', textAlign: 'center', minHeight: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                     {companyData.signature ? (
                         <img src={companyData.signature} alt="Signature" style={{ maxHeight: '60px', maxWidth: '240px', objectFit: 'contain' }} />
                     ) : (
                         <div style={{ height: '40px' }}></div>
                     )}
                     <div style={{ fontSize: '11px', color: '#555', marginTop: '4px', fontWeight: 'bold' }}>Authorized Signatory</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
          
          <div className="w-full max-w-[794px] mx-auto print:hidden mt-8">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="font-bold text-slate-800 text-lg">Share & Download</h3>
                 </div>
                 
                 <div className="p-6">
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     <button 
                       onClick={() => handleShare('whatsapp')} 
                       disabled={isGenerating}
                       className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-emerald-50 border border-slate-100 transition-colors group disabled:opacity-50"
                     >
                       <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                         <i className="fa-brands fa-whatsapp text-2xl"></i>
                       </div>
                       <span className="text-sm font-semibold text-slate-700 font-sans text-center leading-tight">WhatsApp<br/>PDF</span>
                     </button>

                     <button 
                       onClick={() => handleShare('whatsapp-image')} 
                       disabled={isGenerating}
                       className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-emerald-50 border border-slate-100 transition-colors group disabled:opacity-50"
                     >
                       <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                         <i className="fa-solid fa-image text-xl"></i>
                       </div>
                       <span className="text-sm font-semibold text-slate-700 font-sans text-center leading-tight">WhatsApp<br/>Image</span>
                     </button>
                     
                     <button 
                       onClick={() => handleShare('email')} 
                       disabled={isGenerating}
                       className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-red-50 border border-slate-100 transition-colors group disabled:opacity-50"
                     >
                       <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                         <i className="fa-solid fa-envelope text-xl"></i>
                       </div>
                       <span className="text-sm font-semibold text-slate-700 font-sans">Gmail</span>
                     </button>

                     <button 
                       onClick={() => handlePrint('thermal')} 
                       className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group text-slate-700"
                     >
                       <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 shadow-md group-hover:scale-110 transition-transform"><Printer size={22} /></div>
                       <span className="text-sm font-semibold font-sans">Print Thermal</span>
                     </button>

                     <button 
                       onClick={() => handlePrint('normal')} 
                       className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group text-slate-700"
                     >
                       <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 shadow-md group-hover:scale-110 transition-transform"><Monitor size={22} /></div>
                       <span className="text-sm font-semibold font-sans">Print A4</span>
                     </button>
                   </div>
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
