import { Printer, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import LogoOficial from '../assets/logo_oficial.png';
import type { Comprobante } from '../types';
import { useToast } from '../hooks/useToast';

interface Props {
  comprobante: Comprobante;
  onClose: () => void;
}

export default function ComprobanteViewer({ comprobante, onClose }: Props) {
  const { toast } = useToast();
  const formatCurrency = (monto: number, moneda: string) => {
    const simbolo = moneda === 'CRC' ? '₡' : '$';
    return `${simbolo} ${monto.toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMetodoLabel = (metodo: string) => {
    const labels: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      transferencia: 'Transferencia',
      sinpe: 'Sinpe Móvil',
    };
    return labels[metodo] || metodo;
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      window.print();
    } catch (err) {
      console.error('Error al imprimir:', err);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a5', // Comprobantes suelen ser más pequeños
      });

      const primaryColor = '#613192'; // Morado Ventura
      const accentColor = '#00BCD4'; // Turquesa Ventura
      const secondaryColor = '#64748b'; // Gris slate

      // Fondo azul para el encabezado
      // Franja de marca en el encabezado
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      doc.setFillColor(r, g, b); 
      doc.rect(0, 0, 148, 15, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('VENTURA DENTAL - COMPROBANTE DE PAGO', 74, 10, { align: 'center' });

      // Datos del Negocio
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(14);
      doc.text('Ventura Dental', 10, 25);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor);
      doc.text(comprobante.negocio?.direccion || 'San José, Costa Rica', 10, 30);
      doc.text(`Tel: ${comprobante.negocio?.telefono || '+506 0000-0000'}`, 10, 34);

      // Cuadro de Número y Fecha
      doc.setFillColor(239, 246, 255); // #eff6ff
      doc.rect(90, 20, 48, 15, 'F');
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('N° COMPROBANTE', 95, 26);
      doc.setFontSize(11);
      doc.text(`#${comprobante.numero}`, 95, 32);

      // Datos del Paciente
      doc.setDrawColor(226, 232, 240);
      doc.line(10, 45, 138, 45);
      
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      doc.text('PACIENTE:', 10, 52);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(comprobante.paciente_nombre || 'N/A', 10, 57);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      doc.text(`Cédula: ${comprobante.paciente_dni || 'N/A'}`, 10, 62);
      doc.text(`Fecha: ${formatDate(comprobante.pago_fecha)}`, 90, 62);

      // Tabla de Detalles
      let y = 75;
      doc.setFillColor(241, 245, 249);
      doc.rect(10, y - 5, 128, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor);
      doc.text('DESCRIPCIÓN', 15, y);
      doc.text('MONTO', 130, y, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      comprobante.detalles?.forEach((det) => {
        y += 8;
        const prefix = det.es_cuota_principal ? '(*) ' : '(+) ';
        doc.text(`${prefix}${det.macro_nombre || det.descripcion}`, 15, y);
        doc.text(formatCurrency(det.monto, comprobante.moneda), 130, y, { align: 'right' });
      });

      // Saldo del Tratamiento (Si aplica)
      if (comprobante.tratamiento_monto_total) {
        y += 12;
        doc.setDrawColor(226, 232, 240);
        doc.line(70, y - 4, 138, y - 4);
        
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor);
        doc.text('Monto Total Tratamiento:', 70, y);
        doc.setTextColor(0, 0, 0);
        doc.text(formatCurrency(comprobante.tratamiento_monto_total, comprobante.moneda), 130, y, { align: 'right' });
        
        y += 5;
        doc.setTextColor(secondaryColor);
        doc.text('Total Abonado:', 70, y);
        doc.setTextColor(accentColor);
        doc.text(formatCurrency(comprobante.tratamiento_monto_pagado || 0, comprobante.moneda), 130, y, { align: 'right' });
        
        const saldo = (comprobante.tratamiento_monto_total || 0) - (comprobante.tratamiento_monto_pagado || 0);
        if (saldo > 0) {
          y += 5;
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(secondaryColor);
          doc.text('Saldo Pendiente:', 70, y);
          doc.setTextColor(220, 38, 38); // Rojo
          doc.text(formatCurrency(saldo, comprobante.moneda), 130, y, { align: 'right' });
        }
      }

      // Total Final
      y += 15;
      const totalR = parseInt(primaryColor.slice(1, 3), 16);
      const totalG = parseInt(primaryColor.slice(3, 5), 16);
      const totalB = parseInt(primaryColor.slice(5, 7), 16);
      doc.setFillColor(totalR, totalG, totalB); 
      doc.rect(80, y - 7, 58, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('TOTAL PAGADO', 85, y);
      doc.setFontSize(12);
      doc.text(formatCurrency(comprobante.monto, comprobante.moneda), 135, y, { align: 'right' });

      doc.setTextColor(secondaryColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Método de pago: ${getMetodoLabel(comprobante.metodo_pago)}`, 10, y + 10);

      // Firma
      if (comprobante.firma_dataurl) {
        y += 25;
        doc.line(40, y, 108, y);
        doc.text('FIRMA DEL PACIENTE', 74, y + 5, { align: 'center' });
        try {
          doc.addImage(comprobante.firma_dataurl, 'PNG', 54, y - 15, 40, 15);
        } catch (e) {
          console.error('Error adding signature to PDF:', e);
        }
      }

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(secondaryColor);
      doc.text('Este documento es un comprobante oficial de Ventura Dental.', 74, 200, { align: 'center' });

      doc.save(`Comprobante_Ventura_${comprobante.numero}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      toast.error('Error al generar el PDF. Por favor use el botón de imprimir.');
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
      <div 
        className="modal-content" 
        style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', position: 'relative', zIndex: 9999 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0, color: '#1e293b' }}>Comprobante de Pago</h2>
          <div style={{ display: 'flex', gap: '0.5rem', zIndex: 10000 }}>
            <button 
              type="button"
              onClick={handleDownload}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', background: 'var(--brand-purple)', color: 'white', 
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                pointerEvents: 'auto', position: 'relative', zIndex: 10001
              }}
              title="Descargar"
            >
              <Download size={18} /> Descargar
            </button>
            <button 
              type="button"
              onClick={handlePrint}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', background: 'var(--brand-turquoise)', color: 'white', 
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                pointerEvents: 'auto', position: 'relative', zIndex: 10001
              }}
              title="Imprimir"
            >
              <Printer size={18} /> Imprimir
            </button>
            <button 
              type="button"
              onClick={handleClose}
              style={{ 
                padding: '0.5rem 1rem', background: '#64748b', color: 'white', 
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                pointerEvents: 'auto', position: 'relative', zIndex: 10001
              }}
            >
              Cerrar
            </button>
          </div>
        </div>

        <div id="comprobante-content" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--brand-purple)', paddingBottom: '1rem' }}>
            <img src={LogoOficial} alt="Ventura Dental" style={{ height: '60px', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              {comprobante.negocio?.direccion || 'Dirección por definir'}
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              Tel: {comprobante.negocio?.telefono || 'Sin teléfono'}
            </p>
          </div>

          {/* Número de comprobante */}
          <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Comprobante N°</p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-purple)' }}>#{comprobante.numero}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Fecha</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155' }}>{formatDate(comprobante.pago_fecha)}</p>
              </div>
            </div>
          </div>

          {/* Datos del paciente */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Paciente</h3>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{comprobante.paciente_nombre}</p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Cédula: {comprobante.paciente_dni || 'No registrado'} | Tel: {comprobante.paciente_telefono || 'No registrado'}
            </p>
          </div>

          {/* Doctor que atendió */}
          {comprobante.doctor_nombre && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Atendido por</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155' }}>{comprobante.doctor_nombre}</p>
            </div>
          )}

          {/* Cajero que cobró */}
          {comprobante.cajero_nombre && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Cobrado por</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155' }}>{comprobante.cajero_nombre}</p>
            </div>
          )}

          {/* Concepto */}
          {comprobante.concepto && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Concepto</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155' }}>{comprobante.concepto}</p>
            </div>
          )}

          {/* Detalles del Pago */}
          {comprobante.detalles && comprobante.detalles.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Detalle del Pago
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>Descripción</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobante.detalles.map((detalle, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px' }}>
                        {detalle.es_cuota_principal && <span style={{ marginRight: '4px' }}>🦷</span>}
                        {!detalle.es_cuota_principal && <span style={{ marginRight: '4px' }}>➕</span>}
                        {detalle.macro_nombre || detalle.descripcion}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(detalle.monto, comprobante.moneda)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Saldo del Tratamiento */}
          {comprobante.tratamiento_monto_total && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Monto total del tratamiento:</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(comprobante.tratamiento_monto_total, comprobante.moneda)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Total abonado:</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{formatCurrency(comprobante.tratamiento_monto_pagado || 0, comprobante.moneda)}</span>
              </div>
              {comprobante.tratamiento_monto_total > (comprobante.tratamiento_monto_pagado || 0) && (
                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Saldo pendiente:</span>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>
                    {formatCurrency(comprobante.tratamiento_monto_total - (comprobante.tratamiento_monto_pagado || 0), comprobante.moneda)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Total */}
          <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>TOTAL PAGADO</span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e40af' }}>
                {formatCurrency(comprobante.monto, comprobante.moneda)}
              </span>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              Método de pago: {getMetodoLabel(comprobante.metodo_pago)}
            </div>
          </div>

          {/* Firma del paciente */}
          {comprobante.firma_dataurl && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '1rem', margin: '0 2rem' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>FIRMA DEL PACIENTE</p>
                <img 
                  src={comprobante.firma_dataurl} 
                  alt="Firma del paciente" 
                  style={{ maxWidth: '200px', maxHeight: '80px' }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
            <p>Este comprobante es válido como constancia de pago.</p>
            <p>Gracias por confiar en Ventura Dental</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #comprobante-content, #comprobante-content * { visibility: visible; }
          #comprobante-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}