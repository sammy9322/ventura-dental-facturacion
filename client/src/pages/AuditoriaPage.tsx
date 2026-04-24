import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileJson, 
  Activity,
  AlertCircle,
  RefreshCw,
  RefreshCw as RefreshCwIcon
} from 'lucide-react';
import { Layout, Modal } from '../components';
import api from '../services/api';

interface AuditLog {
  id: number;
  usuario_nombre: string;
  accion: string;
  entidad: string;
  entidad_id: number;
  valor_anterior: any;
  valor_nuevo: any;
  ip_address: string;
  created_at: string;
}

export const AuditoriaPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auditoria');
      setLogs(res.data);
      setError('');
    } catch (err: any) {
      setError('No se pudieron cargar los logs de auditoría.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-CR', options);
  };

  const getActionColorClass = (accion: string) => {
    if (accion.includes('ANULAR') || accion.includes('ELIMINAR')) return 'badge-danger';
    if (accion.includes('EDITAR') || accion.includes('ACTUALIZAR')) return 'badge-warning';
    return 'badge-info';
  };

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const inspectDetails = (log: AuditLog) => {
    setSelectedLog(log);
  };

  return (
    <Layout>
      <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 className="page-title">Bitácora de Auditoría</h1>
            <p className="page-subtitle">Trazabilidad inmutable de acciones críticas en el sistema</p>
          </div>
          <div className="stats-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card" style={{ padding: '0.75rem 1.5rem', minWidth: '150px' }}>
              <div className="stat-label">Total Eventos</div>
              <div className="stat-value" style={{ fontSize: '1.5rem' }}>{logs.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--primary)" />
            Registros de Actividad
          </h3>
          <button className="btn btn-outline btn-sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ margin: '1rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Módulo</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {formatDate(log.created_at)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.usuario_nombre || 'Sistema'}</td>
                    <td>
                      <span className={`badge ${getActionColorClass(log.accion)}`}>
                        {log.accion.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                      {log.entidad.replace(/_/g, ' ')}
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => inspectDetails(log)}
                        title="Ver cambios en JSON"
                      >
                        <FileJson size={14} />
                        Inspeccionar
                      </button>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !error && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                      <Activity size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
                      <p>No se han registrado acciones auditables aún.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Detalles de la Acción"
        size="lg"
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-2col" style={{ gap: '1rem', marginBottom: 0 }}>
              <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', marginBottom: 0 }}>
                <div className="stat-label" style={{ marginBottom: '0.25rem' }}>Entidad</div>
                <div style={{ fontWeight: 700, color: 'white' }}>{selectedLog.entidad} (ID: {selectedLog.entidad_id || 'N/A'})</div>
              </div>
              <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', marginBottom: 0 }}>
                <div className="stat-label" style={{ marginBottom: '0.25rem' }}>Dirección IP</div>
                <div style={{ fontWeight: 700, color: 'white' }}>{selectedLog.ip_address || 'Desconocida'}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Valor Anterior</label>
              <pre style={{ 
                background: '#0f172a', 
                padding: '1rem', 
                borderRadius: '8px', 
                color: '#94a3b8', 
                fontSize: '0.8rem', 
                overflowX: 'auto',
                border: '1px solid var(--border)'
              }}>
                {JSON.stringify(selectedLog.valor_anterior, null, 2)}
              </pre>
            </div>

            <div className="form-group">
              <label className="form-label">Valor Nuevo</label>
              <pre style={{ 
                background: '#0f172a', 
                padding: '1rem', 
                borderRadius: '8px', 
                color: '#fff', 
                fontSize: '0.8rem', 
                overflowX: 'auto',
                border: '1px solid var(--accent)'
              }}>
                {JSON.stringify(selectedLog.valor_nuevo, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </Layout>
  );
};

export default AuditoriaPage;
