import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Eye, Calendar, Filter, X } from 'lucide-react';
import { pagoService } from '../services';
import { Layout } from '../components';
import type { Pago, MetodoPago } from '../types';

export default function HistorialPagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
  });
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);

  useEffect(() => {
    loadPagos();
  }, [filters]);

  const loadPagos = async () => {
    setLoading(true);
    try {
      const data = await pagoService.getAll(filters);
      setPagos(data);
    } catch (error) {
      console.error('Error cargando pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ fechaDesde: '', fechaHasta: '', estado: '' });
  };

  const hasActiveFilters = filters.fechaDesde || filters.fechaHasta || filters.estado;

  const formatCurrency = (value: number | string, moneda: string = 'CRC') => {
    const symbol = moneda === 'USD' ? '$' : '₡';
    return `${symbol} ${Number(value).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const metodoEmoji: Record<MetodoPago, string> = {
    efectivo: '💵',
    tarjeta: '💳',
    transferencia: '🏦',
    yape: '📱',
    plin: '📲',
  };

  const metodoLabels: Record<MetodoPago, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    yape: 'Yape',
    plin: 'Plin',
  };

  const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
    completado:      { label: 'Completado',      color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    pendiente_cobro: { label: 'Pendiente Cobro', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    pendiente:       { label: 'Pendiente',       color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    anulado:         { label: 'Anulado',         color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)'  },
  };

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Historial de Pagos</h1>
            <p className="page-subtitle">{pagos.length} pago{pagos.length !== 1 ? 's' : ''} encontrado{pagos.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/pagos/registrar" className="btn btn-primary">
            <PlusCircle size={18} /> Registrar Pago
          </Link>
        </div>
      </div>

      {/* Filtros modernos */}
      <div className="filtros-bar">
        <div className="filtro-item">
          <label className="filtro-label">
            <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Desde
          </label>
          <input
            type="date"
            className="filtro-date"
            value={filters.fechaDesde}
            onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
          />
        </div>

        <div className="filtro-item">
          <label className="filtro-label">
            <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Hasta
          </label>
          <input
            type="date"
            className="filtro-date"
            value={filters.fechaHasta}
            onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
          />
        </div>

        <div className="filtro-item">
          <label className="filtro-label">
            <Filter size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Estado
          </label>
          <select
            className="filtro-select"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="completado">✅ Completados</option>
            <option value="pendiente_cobro">⏳ Pendiente Cobro</option>
            <option value="anulado">❌ Anulados</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="btn btn-outline btn-sm" onClick={clearFilters} style={{ alignSelf: 'flex-end' }}>
            <X size={15} /> Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : pagos.length === 0 ? (
        <div className="empty-state">
          <h3>No hay pagos registrados</h3>
          <p>Comience registrando un nuevo pago</p>
          <Link to="/pagos/registrar" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Registrar Pago
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Concepto</th>
                  <th>Método</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => {
                  const est = estadoConfig[pago.estado] || estadoConfig.pendiente_cobro;
                  return (
                    <tr key={pago.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        #{String(pago.id).padStart(4, '0')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                          {new Date(pago.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {new Date(pago.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {pago.paciente_nombre}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          DNI: {pago.paciente_dni || 'N/A'}
                        </div>
                      </td>
                      <td style={{ maxWidth: '200px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {pago.concepto}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.875rem' }}>
                          {pago.metodo_pago ? `${metodoEmoji[pago.metodo_pago]} ${metodoLabels[pago.metodo_pago]}` : '—'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {formatCurrency(pago.monto, pago.moneda)}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: est.color,
                          background: est.bg,
                          border: `1px solid ${est.color}33`,
                          letterSpacing: '0.02em',
                        }}>
                          {est.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setSelectedPago(pago)}
                        >
                          <Eye size={14} /> Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedPago && (
        <div className="modal-overlay" onClick={() => setSelectedPago(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Pago #{String(selectedPago.id).padStart(4, '0')}</h3>
              <button className="modal-close" onClick={() => setSelectedPago(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha y Hora</span>
                    <span className="detail-value">{formatDate(selectedPago.created_at)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Paciente</span>
                    <span className="detail-value">{selectedPago.paciente_nombre}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>DNI: {selectedPago.paciente_dni || 'No registrado'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registrado por</span>
                    <span className="detail-value">{selectedPago.doctor_nombre || selectedPago.secretaria_nombre || '—'}</span>
                  </div>
                </div>
                <div>
                  <div className="detail-item">
                    <span className="detail-label">Monto</span>
                    <span className="detail-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>
                      {formatCurrency(selectedPago.monto, selectedPago.moneda)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Método de Pago</span>
                    <span className="detail-value">
                      {selectedPago.metodo_pago ? `${metodoEmoji[selectedPago.metodo_pago]} ${metodoLabels[selectedPago.metodo_pago]}` : '— (Pendiente de cobro)'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estado</span>
                    {(() => {
                      const est = estadoConfig[selectedPago.estado] || estadoConfig.pendiente_cobro;
                      return (
                        <span style={{
                          display: 'inline-block',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '999px',
                          fontWeight: 600,
                          color: est.color,
                          background: est.bg,
                        }}>
                          {est.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <div className="detail-item" style={{ marginTop: '1rem' }}>
                <span className="detail-label">Concepto</span>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedPago.concepto}</p>
              </div>
              {selectedPago.firma_dataurl && (
                <div className="detail-item">
                  <span className="detail-label">Firma del Paciente</span>
                  <img
                    src={selectedPago.firma_dataurl}
                    alt="Firma del paciente"
                    style={{ maxWidth: '200px', display: 'block', borderBottom: '1px solid var(--border)', marginTop: '0.5rem' }}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedPago(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
