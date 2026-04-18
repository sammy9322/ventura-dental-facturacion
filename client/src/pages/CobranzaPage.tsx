import { useQuery } from '@tanstack/react-query';
import { 
  Phone, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { tratamientoService } from '../services';
import { Layout } from '../components';
import { TIPOS_TRATAMIENTO } from '../types';

export default function CobranzaPage() {
  const { data: tratamientos, isLoading } = useQuery({
    queryKey: ['tratamientos-deuda'],
    queryFn: async () => {
      const data = await tratamientoService.getAll({ estado: 'activo' });
      // Filtrar solo los que tienen deuda > 0 y ordenar por deuda descendente
      return data
        .filter((t: any) => (t.monto_total - t.monto_pagado) > 0)
        .sort((a: any, b: any) => (b.monto_total - b.monto_pagado) - (a.monto_total - a.monto_pagado));
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const getTipoLabel = (tipo: string) => {
    return TIPOS_TRATAMIENTO.find(t => t.value === tipo)?.label || tipo;
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Gestión de Cobranzas</h1>
        <p className="page-subtitle">Priorización de recuperación de carteras por cobrar (Enfoque IE)</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pacientes con Saldo Pendiente</h3>
          <div className="badge badge-danger">
            {tratamientos?.length || 0} Cuentas por Cobrar
          </div>
        </div>

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Tratamiento</th>
                  <th>Monto Total</th>
                  <th>Monto Pagado</th>
                  <th>Saldo Pendiente</th>
                  <th style={{textAlign: 'right'}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tratamientos?.map((t: any) => {
                  const saldo = t.monto_total - t.monto_pagado;
                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{t.paciente_nombre}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>DNI: {t.paciente_dni}</div>
                      </td>
                      <td>
                        <div className="badge badge-info">{getTipoLabel(t.tipo)}</div>
                      </td>
                      <td>{formatCurrency(t.monto_total)}</td>
                      <td style={{color: 'var(--accent)'}}>{formatCurrency(t.monto_pagado)}</td>
                      <td>
                        <div style={{color: 'var(--danger)', fontWeight: 700, fontSize: '1rem'}}>
                          {formatCurrency(saldo)}
                        </div>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                          <button className="btn btn-outline btn-sm" title="Contactar">
                            <Phone size={14} />
                          </button>
                          <button className="btn btn-primary btn-sm">
                            Detalles <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {tratamientos?.length === 0 && (
              <div style={{padding: '3rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                <AlertCircle size={48} style={{margin: '0 auto 1rem', opacity: 0.3}} />
                <p>No hay saldos pendientes en tratamientos activos.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
