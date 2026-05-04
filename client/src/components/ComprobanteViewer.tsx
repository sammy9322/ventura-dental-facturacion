import { Printer, Download } from 'lucide-react';
import LogoOficial from '../assets/logo_oficial.png';
import type { Comprobante } from '../types';

interface Props {
  comprobante: Comprobante;
  onClose: () => void;
}

export default function ComprobanteViewer({ comprobante, onClose }: Props) {
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const printContent = document.getElementById('comprobante-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Comprobante de Pago #${comprobante.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Comprobante de Pago</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-outline" 
              onClick={handleDownload}
              title="Descargar"
            >
              <Download size={18} />
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handlePrint}
              title="Imprimir"
            >
              <Printer size={18} />
            </button>
          </div>
        </div>

        <div id="comprobante-content" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #1e40af', paddingBottom: '1rem' }}>
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
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e40af' }}>#{comprobante.numero}</p>
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