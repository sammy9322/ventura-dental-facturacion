import React, { useState, useEffect } from 'react';
import '../styles/AuditoriaPage.css';

interface AuditLog {
  id: number;
  usuario_nombre: string;
  accion: string;
  entidad: string;
  fecha_registro: string;
  valor_anterior: any;
  valor_nuevo: any;
}

export const AuditoriaPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLogs([
        {
          id: 1,
          usuario_nombre: 'Admin Principal',
          accion: 'ANULAR_PAGO',
          entidad: 'pagos',
          fecha_registro: new Date().toISOString(),
          valor_anterior: { monto: 50000, estado: 'completado' },
          valor_nuevo: { estado: 'anulado' }
        },
        {
          id: 2,
          usuario_nombre: 'Doctor Juan',
          accion: 'EDITAR_PRECIO',
          entidad: 'tratamientos_micro',
          fecha_registro: new Date(Date.now() - 86400000).toISOString(),
          valor_anterior: { precio: 25000 },
          valor_nuevo: { precio: 20000 }
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-CR', options);
  };

  const getActionColor = (accion: string) => {
    if (accion.includes('ANULAR') || accion.includes('ELIMINAR')) return 'tag-danger';
    if (accion.includes('EDITAR')) return 'tag-warning';
    return 'tag-primary';
  };

  return (
    <div className="audit-container animate-fade-in">
      <header className="audit-header">
        <div>
          <h1 className="audit-title">Bitácora de Auditoría</h1>
          <p className="audit-subtitle">
            Trazabilidad inmutable de acciones críticas (Enfoque de Seguridad)
          </p>
        </div>
        <div className="audit-stats">
          <div className="stat-card">
            <span className="stat-value">{logs.length}</span>
            <span className="stat-label">Eventos Registrados</span>
          </div>
        </div>
      </header>

      <main className="audit-content glass-panel">
        {loading ? (
          <div className="loader-container">
            <div className="neon-spinner"></div>
            <p>Conectando con base de datos segura...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="neon-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Módulo</th>
                  <th>Auditoría JSON</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="table-row-hover">
                    <td className="text-muted">{formatDate(log.fecha_registro)}</td>
                    <td className="font-semibold">{log.usuario_nombre}</td>
                    <td>
                      <span className={`status-tag ${getActionColor(log.accion)}`}>
                        {log.accion.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-muted" style={{ textTransform: 'capitalize' }}>
                      {log.entidad.replace('_', ' ')}
                    </td>
                    <td>
                      <button 
                        className="btn-ver-detalle"
                        onClick={() => alert(`Antes: ${JSON.stringify(log.valor_anterior)}\nDespués: ${JSON.stringify(log.valor_nuevo)}`)}
                      >
                        Inspeccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <div className="empty-state">
                <p>No se han registrado acciones destructivas recientemente.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AuditoriaPage;
