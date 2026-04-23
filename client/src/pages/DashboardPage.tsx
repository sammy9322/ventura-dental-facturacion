import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  CreditCard, 
  Activity, 
  Clock, 
  ArrowUpRight,
  PlusCircle,
  FileText,
  UserPlus,
  Calculator
} from 'lucide-react';
import { pagoService, authService } from '../services';
import { Layout } from '../components';

export default function DashboardPage() {
  const user = authService.getUser();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => pagoService.getStats(),
  });

  const { data: advancedStats, isLoading: advancedLoading } = useQuery({
    queryKey: ['advancedStats'],
    queryFn: () => pagoService.getAdvancedStats(),
  });

  const isLoading = statsLoading || advancedLoading;

  const getSym = (m: string) => m === 'USD' ? '$' : '₡';

  const formatWithSym = (value: string | number, moneda: string = 'CRC') => {
    return `${getSym(moneda)} ${Number(value).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;
  };

  const metodoLabels: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transf.',
    yape: 'Yape',
    plin: 'Plin',
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Panel de Control Operativo</h1>
        <p className="page-subtitle">Bienvenido de nuevo, <span style={{color: 'var(--primary)', fontWeight: 600}}>{user?.nombre_completo}</span></p>
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Ingresos Totales</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {stats?.resumen && stats.resumen.length > 0 ? stats.resumen.map((s: any) => (
                  <div key={s.moneda} className="stat-value" style={{ fontSize: '1.5rem' }}>
                    {formatWithSym(s.total, s.moneda)}
                  </div>
                )) : <div className="stat-value">₡ 0.00</div>}
              </div>
              <div style={{marginTop: '0.5rem', color: 'var(--accent)', fontSize: '0.875rem', display: 'flex', alignItems: 'center'}}>
                <TrendingUp size={16} style={{marginRight: '4px'}} /> Al día de hoy
              </div>
            </div>

            <div className="stat-card" style={{borderLeft: '4px solid var(--danger)'}}>
              <div className="stat-label">Deuda Activa (IE)</div>
              <div className="stat-value" style={{color: 'var(--danger)'}}>{formatWithSym(advancedStats?.deuda_activa || 0, 'CRC')}</div>
              <div style={{marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem'}}>
                <Clock size={16} style={{marginRight: '4px', verticalAlign: 'middle'}} /> Por cobrar en tratamientos activos
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Eficiencia de Cobro</div>
              <div className="stat-value">{Number(advancedStats?.eficiencia_cobranza || 0).toFixed(1)}%</div>
              <div style={{marginTop: '0.75rem', background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{width: `${advancedStats?.eficiencia_cobranza || 0}%`, height: '100%', background: 'var(--primary)'}}></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Pacientes Activos</div>
              <div className="stat-value">{advancedStats?.total_pacientes_activos || 0}</div>
              <div style={{marginTop: '0.5rem', color: 'var(--accent)', fontSize: '0.875rem'}}>
                <Activity size={16} style={{marginRight: '4px', verticalAlign: 'middle'}} /> {advancedStats?.total_tratamientos_activos || 0} casos en curso
              </div>
            </div>
          </div>

          <div className="grid-2col">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Acciones Estratégicas</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <Link to="/pagos/registrar" className="btn btn-success btn-lg" style={{justifyContent: 'flex-start', padding: '1.5rem'}}>
                  <PlusCircle size={24} /> Registrar Pago
                </Link>
                <Link to="/pacientes" className="btn btn-outline btn-lg" style={{justifyContent: 'flex-start', padding: '1.5rem'}}>
                  <UserPlus size={24} /> Nuevo Paciente
                </Link>
                <Link to="/cierre-caja" className="btn btn-outline btn-lg" style={{justifyContent: 'flex-start', padding: '1.5rem'}}>
                  <Calculator size={24} /> Cierre de Caja
                </Link>
                <Link to="/tratamientos" className="btn btn-outline btn-lg" style={{justifyContent: 'flex-start', padding: '1.5rem'}}>
                  <Activity size={24} /> Ver Tratamientos
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Tendencia de Ingresos</h3>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {advancedStats?.tendencia_mensual?.map((item: any) => (
                  <div key={`${item.mes}-${item.moneda}`} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px'}}>
                    <span style={{color: 'var(--text-secondary)', fontWeight: 500}}>{item.mes} ({item.moneda})</span>
                    <span style={{fontWeight: 600}}>{formatWithSym(item.total_monto, item.moneda)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {stats?.por_metodo && stats.por_metodo.length > 0 && (
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-header">
                <h3 className="card-title">Distribución por Método de Pago</h3>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Método de Pago</th>
                      <th>N° Operaciones</th>
                      <th style={{textAlign: 'right'}}>Monto Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.por_metodo.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          {item.moneda === 'USD' ? <PlusCircle size={16} /> : <CreditCard size={16} />}
                          {metodoLabels[item.metodo_pago] || item.metodo_pago} ({item.moneda})
                        </td>
                        <td>{item.cantidad}</td>
                        <td style={{textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)'}}>
                          {formatWithSym(item.total, item.moneda)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
