import React from 'react';
import { Download, Printer, X } from 'lucide-react';

export default function ComprobanteViewer({ comprobante, onClose }: any) {
    if (!comprobante) return null;
    const handlePrint = () => window.print();
    const handleDownload = () => {
          const blob = new Blob([JSON.stringify(comprobante, null, 2)], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `comprobante-${comprobante.numero || 'pago'}.txt`;
          a.click();
          URL.revokeObjectURL(url);
    };

  return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '90%', position: 'relative' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                      <h2 style={{ margin: 0 }}>Comprobante de Pago</h2>h2>
                                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <button onClick={handleDownload} style={{ padding: '0.5rem 1rem', background: '#6B46C1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <Download size={18} /> Descargar
                                                    </button>button>
                                                    <button onClick={handlePrint} style={{ padding: '0.5rem 1rem', background: '#319795', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <Printer size={18} /> Imprimir
                                                    </button>button>
                                                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>button>
                                      </div>div>
                          </div>div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                      <div><p style={{ margin: 0, color: '#666', fontSize: '0.75rem' }}>PACIENTE</p>p><p style={{ margin: 0, fontWeight: 'bold' }}>{comprobante.paciente_nombre}</p>p></div>div>
                                    <div style={{ textAlign: 'right' }}><p style={{ margin: 0, color: '#666', fontSize: '0.75rem' }}>N</div>
