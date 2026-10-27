import React, { useState } from 'react';
import { ArrowLeft, Download, Printer, Share2, Check, Monitor } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Estimate, CompanyData } from './types';

export function InvoiceView({
  estimate,
  companyData,
  setCompanyData,
  onBack,
  autoShare = false
}: {
  estimate: Estimate;
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  onBack: () => void;
  autoShare?: boolean;
}) {
  const subtotal = estimate.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (autoShare) {
      // Small delay to ensure the DOM is ready for html-to-image
      const timer = setTimeout(() => {
        handleShare();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoShare]);
  
  const generatePDFBlob = async (): Promise<{blob: Blob, fileName: string} | null> => {
    const element = document.getElementById('invoice-paper');
    if (!element) return null;
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const elHeight = element.scrollHeight > 1123 ? element.scrollHeight : 1123;
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
          const el = doc.getElementById('invoice-paper');
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
        fileName: `${estimate.isSale ? 'Invoice' : 'Estimate'}_${estimate.refNo}.pdf`
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
    const element = document.getElementById('invoice-paper');
    if (!element) return null;
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const elHeight = element.scrollHeight > 1123 ? element.scrollHeight : 1123;
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
          const el = doc.getElementById('invoice-paper');
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
      return { blob, fileName: `${estimate.isSale ? 'Invoice' : 'Estimate'}_${estimate.refNo}.jpg` };
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
            text: `Here is your ${estimate.isSale ? 'invoice' : 'estimate'} from ${companyData.name}`
          });
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('File Share API failed:', err);
      }
    }

    const text = `Invoice from ${companyData.name}\nInvoice No: ${estimate.refNo}\nTotal Amount: Rs ${estimate.totalAmount}`;
    
    if (platform?.startsWith('whatsapp')) {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`mailto:?subject=${estimate.isSale ? 'Invoice' : 'Estimate'} ${estimate.refNo}&body=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handlePrint = (type: 'normal' | 'thermal') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceContent = document.getElementById('invoice-paper')?.innerHTML;
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
             #invoice-paper { 
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
             .repl-table { width: 100% !important; table-layout: fixed !important; }
             .repl-table td, .repl-table th { word-wrap: break-word !important; }
             .print\\:hidden { display: none !important; }
             @page { 
               margin: 0; 
               size: ${type === 'thermal' ? '80mm auto' : 'A4'}; 
             }
          </style>
        </head>
        <body>
          <div id="invoice-paper">
            ${invoiceContent}
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
                <h2 className="font-bold text-slate-800 text-xl">Preview</h2>
              </div>
              <div className="flex gap-4 items-center">
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
                   className={`px-4 py-2 ${estimate.isSale ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                 >
                   {isGenerating ? (
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : <Download size={16} />}
                   {isGenerating ? 'Generating...' : 'Download PDF'}
                 </button>
                 <button onClick={onBack} className={`${estimate.isSale ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'} font-semibold underline text-sm`}>Save & Close</button>
              </div>
            </div>

            <div id="invoice-paper" className="bg-white border border-slate-200 shadow-xl p-0 print:shadow-none print:border-none print:p-0 relative min-h-[1123px] w-[794px] mx-auto text-black font-sans leading-snug flex flex-col">
          <style dangerouslySetInnerHTML={{__html: `
            .repl-table th, .repl-table td { border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 6px 8px; }
            .repl-table th:last-child, .repl-table td:last-child { border-right: none; }
            .repl-table th { font-weight: bold; background-color: #f8fafc; }
            #invoice-paper * { box-sizing: border-box; }
            #invoice-paper { padding: 40px !important; }
          `}} />
          
          <h2 style={{ textAlign: 'center', color: '#111827', fontSize: '28px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
            {estimate.isSale ? 'Invoice' : 'Estimate'}
          </h2>

          <div style={{ border: '1px solid #000', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', padding: '15px', borderBottom: '1px solid #000', alignItems: 'center' }}>
               <div style={{ width: '90px', height: '90px', border: '1px solid #000', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff' }}>
                  {companyData.logo ? (
                     <img src={companyData.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                     <div style={{ color: '#000', fontWeight: '900', fontSize: '28px', border: '3px solid #000', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>JAG</div>
                  )}
               </div>
               <div style={{ flex: 1 }}>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827', fontWeight: 'bold' }}>{companyData.name || 'Business Name'}</h1>
                  <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#374151', fontWeight: '500' }}>{companyData.address || 'Company Address'}</p>
                  <div style={{ display: 'flex', fontSize: '11px', color: '#111827', gap: '30px', flexWrap: 'wrap' }}>
                     <div>Phone: <b style={{ fontWeight: 'bold' }}>{companyData.phone || '0000000000'}</b></div>
                     {companyData.landline && <div>Landline: <b style={{ fontWeight: 'bold' }}>{companyData.landline}</b></div>}
                     <div>Email: <b style={{ fontWeight: 'bold' }}>{companyData.email || 'email@example.com'}</b></div>
                  </div>
               </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
               <div style={{ flex: 1, borderRight: '1px solid #000' }}>
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '10px', fontWeight: 'bold', background: '#f8fafc' }}>{estimate.isSale ? 'Invoice For:' : 'Estimate For:'}</div>
                  <div style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 'normal', minHeight: '50px', wordBreak: 'break-word', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>{estimate.customerName}</div>
                    {estimate.customerPhone && <div style={{ fontSize: '11px' }}>Phone: <span style={{ fontWeight: 'bold' }}>{estimate.customerPhone}</span></div>}
                    {estimate.billingAddress && <div style={{ fontWeight: 'normal', fontSize: '11px', whiteSpace: 'pre-wrap', color: '#374151' }}>{estimate.billingAddress}</div>}
                  </div>
               </div>
               <div style={{ width: '350px' }}>
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '10px', fontWeight: 'bold', background: '#f8fafc' }}>{estimate.isSale ? 'Invoice Details:' : 'Estimate Details:'}</div>
                   <div style={{ padding: '8px 10px', fontSize: '11px', color: '#111827', minHeight: '50px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><span style={{ color: '#374151' }}>No:</span> <b style={{ color: '#000' }}>{estimate.refNo}</b></div>
                    {estimate.customerRefNo && <div><span style={{ color: '#374151' }}>Customer Ref No:</span> <b style={{ color: '#000' }}>{estimate.customerRefNo}</b></div>}
                    <div><span style={{ color: '#374151' }}>Date:</span> <b style={{ color: '#000' }}>{estimate.date}</b></div>
                    <div><span style={{ color: '#374151' }}>Time:</span> <b style={{ color: '#000' }}>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</b></div>
                  </div>
               </div>
            </div>

             <div style={{ flex: 1, borderBottom: '1px solid #000' }}>
                <table className="repl-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', tableLayout: 'fixed' }}>
                 <thead>
                   <tr style={{ background: '#f8fafc', fontSize: '10px' }}>
                     <th style={{ width: '44px', textAlign: 'left', padding: '6px 10px' }}>#</th>
                     <th style={{ textAlign: 'left', width: 'auto', padding: '6px 10px' }}>Item name</th>
                     <th style={{ width: '90px', textAlign: 'right', padding: '6px 10px' }}>Quantity</th>
                     <th style={{ width: '120px', textAlign: 'right', padding: '6px 10px' }}>Price/ Unit (₨)</th>
                     <th style={{ width: '140px', textAlign: 'right', padding: '6px 10px' }}>Amount(₨)</th>
                   </tr>
                 </thead>
                 <tbody>
                   {estimate.items.map((item, index) => (
                      <tr key={index}>
                        <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>{index + 1}</td>
                        <td style={{ verticalAlign: 'top', fontWeight: 'bold', color: '#111', wordBreak: 'break-word', whiteSpace: 'normal', paddingRight: '8px' }}>{item.name || 'Item Name'}</td>
                        <td style={{ verticalAlign: 'top', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ verticalAlign: 'top', textAlign: 'right' }}>₨ {item.rate.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td style={{ verticalAlign: 'top', textAlign: 'right' }}>₨ {((item.quantity * item.rate) || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      </tr>
                   ))}
                   <tr>
                     <td colSpan={2} style={{ fontWeight: 'bold', paddingLeft: '10px' }}>Total</td>
                     <td style={{ fontWeight: 'bold', textAlign: 'right' }}>{estimate.items.reduce((s, i) => s + i.quantity, 0)}</td>
                     <td></td>
                     <td style={{ fontWeight: 'bold', textAlign: 'right' }}>₨ {subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                   </tr>
                 </tbody>
                </table>
             </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
               <div style={{ flex: 1, borderRight: '1px solid #000' }}></div>
               <div style={{ width: '350px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px 15px', borderBottom: '1px solid #000', fontWeight: '500' }}>Sub Total</td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #000', textAlign: 'center', width: '20px' }}>:</td>
                        <td style={{ padding: '6px 15px', borderBottom: '1px solid #000', textAlign: 'right', fontWeight: 'bold' }}>₨ {subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 15px', borderBottom: '1px solid #000', fontWeight: 'bold' }}>Total</td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                        <td style={{ padding: '6px 15px', borderBottom: '1px solid #000', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>₨ {estimate.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} style={{ padding: '6px 15px', borderBottom: '1px solid #000', fontWeight: 'bold', background: '#f8fafc', fontSize: '11px' }}>{estimate.isSale ? 'Invoice Amount In Words :' : 'Estimate Amount In Words :'}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} style={{ padding: '10px 15px', borderBottom: '1px solid #000', minHeight: '40px', verticalAlign: 'top', textTransform: 'capitalize', fontSize: '12px' }}>
                          {numberToWords(estimate.totalAmount)}
                        </td>
                      </tr>
                          <tr>
                            <td style={{ padding: '6px 15px', borderBottom: '1px solid #000', fontWeight: '500' }}>Received</td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #000', textAlign: 'center', width: '20px' }}>:</td>
                            <td style={{ padding: '6px 15px', borderBottom: '1px solid #000', textAlign: 'right', fontWeight: 'bold' }}>₨ {(estimate.receivedAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 15px', borderBottom: 'none', fontWeight: '500' }}>Balance</td>
                            <td style={{ padding: '6px 10px', borderBottom: 'none', textAlign: 'center', width: '20px' }}>:</td>
                            <td style={{ padding: '6px 15px', borderBottom: 'none', textAlign: 'right', fontWeight: 'bold' }}>₨ {(estimate.balance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                          </tr>
                    </tbody>
                  </table>
               </div>
            </div>

            <div style={{ borderBottom: '1px solid #000' }}>
               <div style={{ padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '11px', fontWeight: 'bold', background: '#f8fafc' }}>Terms And Conditions:</div>
               <div style={{ padding: '10px 10px', fontSize: '12px', color: '#111', whiteSpace: 'pre-wrap' }}>
                  {companyData.terms || 'Thank you for doing business with us.'}
               </div>
            </div>

            <div style={{ display: 'flex' }}>
               <div style={{ flex: 1, borderRight: '1px solid #000' }}></div>
               <div style={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '11px', fontWeight: 'bold', background: '#f8fafc' }}>For {companyData.name || 'Business Name'}:</div>
                  <div style={{ padding: '15px', textAlign: 'center', minHeight: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                     {companyData.signature ? (
                         <img src={companyData.signature} alt="Signature" style={{ maxHeight: '60px', maxWidth: '240px', objectFit: 'contain' }} />
                     ) : (
                         <div style={{ height: '50px' }}></div>
                     )}
                     <div style={{ fontSize: '12px', color: '#555', marginTop: '6px', fontWeight: 'bold' }}>Authorized Signatory</div>
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
                       disabled={isGenerating}
                       className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group text-slate-700 disabled:opacity-50"
                     >
                       <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 shadow-md group-hover:scale-110 transition-transform"><Printer size={22} /></div>
                       <span className="text-sm font-semibold font-sans">Print Thermal</span>
                     </button>

                     <button 
                       onClick={() => handlePrint('normal')} 
                       disabled={isGenerating}
                       className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group text-slate-700 disabled:opacity-50"
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
