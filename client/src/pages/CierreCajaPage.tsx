import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calculator, 
  CheckCircle, 
  AlertCircle, 
  History, 
  Save, 
  RefreshCcw,
  DollarSign,
  CreditCard,
  Send,
  Calendar
} from 'lucide-react';
import { Layout } from '../components';
import { cierreCajaService } from '../services';

export default function CierreCajaPage() {
  const queryClient = useQueryClient();
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  
  // Estados para montos reales (lo que cuenta la secretaria)
  const [realEfectivo, setRealEfectivo] = useState<number>(0);
  const [realTarjeta, setRealTarjeta] = useState<number>(0);
  const [realTransferencia, setRealTransferencia] = useState<number>(0);
  const [realOtros, setRealOtros] = useState<number>(0);
  const [observaciones, setObservaciones] = useState('');

  // Cargar preview del cierre
  const { data: preview, isLoading, refetch } = useQuery({
    queryKey: ['cierrePreview', fecha],
    queryFn: () => cierreCajaService.getCierrePreview(fecha),
  });

  // Historial de cierres
  const { data: historial } = useQuery({
    queryKey: ['cierreHistory'],
    queryFn: () => cierreCajaService.getCierreHistory(),
  });

  // Mutación para guardar el cierre
  const saveMutation = useMutation({
    mutationFn: (data: any) => cierreCajaService.saveCierre(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cierrePreview'] });
      queryClient.invalidateQueries({ queryKey: ['cierreHistory'] });
      alert('Cierre de caja guardado con éxito');
    },
    onError: (error: any) => {
      alert('Error al guardar el cierre: ' + (error.response?.data?.error || error.message));
    }
  });

  // Efecto para pre-poblar si ya existe un cierre
  useEffect(() => {
    if (preview?.cierreExistente) {
      const c = preview.cierreExistente;
      setRealEfectivo(Number(c.real_efectivo));
      setRealTarjeta(Number(c.real_tarjeta));
      setRealTransferencia(Number(c.real_transferencia));
      setRealOtros(Number(c.real_otros));
      setObservaciones(c.observaciones || '');
    } else {
      setRealEfectivo(0);
      setRealTarjeta(0);
      setRealTransferencia(0);
      setRealOtros(0);
      setObservaciones('');
    }
  }, [preview]);

  // Cálculos de totales esperados (agrupando por moneda si hay varias, pero para el input consolidamos a CRC o principal)
  // Nota: En esta versión simplificada sumamos asumiendo que el usuario sabe lo que hace, 
  // pero lo ideal es mostrar el desglose por moneda.
  const calcTotalEsperado = (items: any[]) => {
    return items?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;
  };

  const espEfectivo = calcTotalEsperado(preview?.resumen?.efectivo);
  const espTarjeta = calcTotalEsperado(preview?.resumen?.tarjeta);
  const espTransferencia = calcTotalEsperado(preview?.resumen?.transferencia);
  const espOtros = calcTotalEsperado(preview?.resumen?.otros);

  const totalEsperado = espEfectivo + espTarjeta + espTransferencia + espOtros;
  const totalReal = realEfectivo + realTarjeta + realTransferencia + realOtros;
  const diferencia = totalReal - totalEsperado;

  const handleSave = () => {
    if (confirm('¿Está seguro de finalizar el cierre de caja para esta fecha?')) {
      saveMutation.mutate({
        fecha,
        esperado_efectivo: espEfectivo,
        esperado_tarjeta: espTarjeta,
        esperado_transferencia: espTransferencia,
        esperado_otros: espOtros,
        real_efectivo: realEfectivo,
        real_tarjeta: realTarjeta,
        real_transferencia: realTransferencia,
        real_otros: realOtros,
        diferencia,
        observaciones
      });
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(val);
  };

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 className="page-title">Cierre de Caja Diario</h1>
            <p className="page-subtitle">Conciliación de ingresos y arqueo de caja</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input 
                type="date" 
                className="form-input" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)}
                style={{ paddingLeft: '40px', width: '200px' }}
              />
            </div>
            <button className="btn btn-outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCcw size={18} className={isLoading ? 'spinner' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid-2col">
        {/* Columna Izquierda: Lo que dice el sistema */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={20} color="var(--primary)" />
              Montos Esperados (Sistema)
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="stat-row">
              <span>Efectivo:</span>
              <span className="font-mono">{formatMoney(espEfectivo)}</span>
            </div>
            <div className="stat-row">
              <span>Tarjeta (Voucher/Datafono):</span>
              <span className="font-mono">{formatMoney(espTarjeta)}</span>
            </div>
            <div className="stat-row">
              <span>Transferencia Bancaria:</span>
              <span className="font-mono">{formatMoney(espTransferencia)}</span>
            </div>
            <div className="stat-row">
              <span>Otros (Sinpe/Yape/Plin):</span>
              <span className="font-mono">{formatMoney(espOtros)}</span>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
            
            <div className="stat-row" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
              <span>Total Esperado:</span>
              <span>{formatMoney(totalEsperado)}</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              Estos montos son calculados automáticamente basados en los pagos marcados como "Completados" en la fecha seleccionada.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Arqueo Real */}
        <div className="card" style={{ border: preview?.cierreExistente ? '1px solid var(--accent)' : 'none' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={20} color="var(--accent)" />
              Arqueo Real (Conteo Físico)
            </h3>
            {preview?.cierreExistente && (
              <span className="badge badge-success">Cerrado</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Efectivo contado:</label>
              <input 
                type="number" 
                className="form-input" 
                value={realEfectivo} 
                onChange={(e) => setRealEfectivo(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tarjeta (Suma de vouchers):</label>
              <input 
                type="number" 
                className="form-input" 
                value={realTarjeta} 
                onChange={(e) => setRealTarjeta(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Transferencias verificadas:</label>
              <input 
                type="number" 
                className="form-input" 
                value={realTransferencia} 
                onChange={(e) => setRealTransferencia(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Otros (Sinpe/App):</label>
              <input 
                type="number" 
                className="form-input" 
                value={realOtros} 
                onChange={(e) => setRealOtros(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observaciones:</label>
              <textarea 
                className="form-textarea" 
                value={observaciones} 
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas sobre diferencias, faltantes o sobrantes..."
                rows={2}
              />
            </div>

            <div style={{ 
              marginTop: '1rem', 
              padding: '1.5rem', 
              borderRadius: '12px',
              background: diferencia === 0 ? 'rgba(16, 185, 129, 0.1)' : diferencia > 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${diferencia === 0 ? 'var(--accent)' : diferencia > 0 ? 'var(--primary)' : 'var(--danger)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>Diferencia:</span>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  color: diferencia === 0 ? 'var(--success)' : diferencia > 0 ? 'var(--primary)' : 'var(--danger)'
                }}>
                  {formatMoney(diferencia)}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'right', opacity: 0.8 }}>
                {diferencia === 0 ? 'Caja cuadrada' : diferencia > 0 ? 'Sobrante en caja' : 'Faltante en caja'}
              </p>
            </div>

            <button 
              className="btn btn-success" 
              style={{ marginTop: '1rem', width: '100%', height: '50px' }}
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              <Save size={20} />
              {preview?.cierreExistente ? 'Actualizar Cierre' : 'Finalizar Cierre de Caja'}
            </button>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} />
            Historial Reciente de Cierres
          </h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Responsable</th>
                <th style={{ textAlign: 'right' }}>Efectivo</th>
                <th style={{ textAlign: 'right' }}>Total Real</th>
                <th style={{ textAlign: 'right' }}>Diferencia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historial?.map((c: any) => (
                <tr key={c.id}>
                  <td>{new Date(c.fecha).toLocaleDateString()}</td>
                  <td>{c.usuario_nombre}</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(c.real_efectivo)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney(Number(c.real_efectivo) + Number(c.real_tarjeta) + Number(c.real_transferencia) + Number(c.real_otros))}</td>
                  <td style={{ 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: Number(c.diferencia) === 0 ? 'var(--success)' : Number(c.diferencia) > 0 ? 'var(--primary)' : 'var(--danger)'
                  }}>
                    {formatMoney(c.diferencia)}
                  </td>
                  <td>
                    <span className="badge badge-success">Cerrado</span>
                  </td>
                </tr>
              ))}
              {(!historial || historial.length === 0) && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay cierres registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          color: var(--text-secondary);
        }
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          color: var(--text-primary);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}
