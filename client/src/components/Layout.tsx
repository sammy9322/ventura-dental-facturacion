import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, History, Activity, Users,
  Settings, LogOut, Receipt, Bell, UserPlus
} from 'lucide-react';
import { authService } from '../services';
import type { Rol } from '../types';
import api from '../services/api';

interface Props { children: React.ReactNode }

export default function Layout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ nombre_completo: string; rol: Rol } | null>(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  // Sondear notificaciones para secretaria/admin
  const fetchNotif = useCallback(async () => {
    if (!user) return;
    if (user.rol === 'secretaria' || user.rol === 'admin') {
      try {
        const res = await api.get('/notificaciones/pendientes');
        setNotifCount(res.data.total ?? 0);
      } catch { /* silencioso */ }
    }
  }, [user]);

  useEffect(() => {
    fetchNotif();
    const interval = setInterval(fetchNotif, 15000);
    return () => clearInterval(interval);
  }, [fetchNotif]);

  const handleLogout = () => { authService.logout(); navigate('/login'); };

  const rol = user?.rol ?? 'doctor';

  // ── Sidebar por rol ─────────────────────────────────────────────
  type NavItem = { path: string; label: string; icon: React.ReactNode; badge?: number };
  const navItems: NavItem[] = [];

  if (rol === 'admin') {
    navItems.push(
      { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/pagos/registrar', label: 'Registrar Pago', icon: <Wallet size={20} /> },
      { path: '/cobros/pendientes', label: 'Cobros Pendientes', icon: <Bell size={20} />, badge: notifCount },
      { path: '/pagos', label: 'Historial', icon: <History size={20} /> },
      { path: '/tratamientos', label: 'Tratamientos', icon: <Activity size={20} /> },
      { path: '/pacientes', label: 'Pacientes', icon: <Users size={20} /> },
      { path: '/cobranzas', label: 'Cobranzas', icon: <Receipt size={20} /> },
      { path: '/macro-tratamientos', label: 'Procesos Clínicos', icon: <Settings size={20} /> },
      { path: '/usuarios', label: 'Usuarios', icon: <Settings size={20} /> },
    );
  } else if (rol === 'doctor') {
    navItems.push(
      { path: '/pagos/registrar', label: 'Registrar Pago', icon: <Wallet size={20} /> },
      { path: '/tratamientos', label: 'Tratamientos', icon: <Activity size={20} /> },
      { path: '/pacientes', label: 'Pacientes', icon: <Users size={20} /> },
    );
  } else if (rol === 'secretaria') {
    navItems.push(
      { path: '/cobros/pendientes', label: 'Cobros Pendientes', icon: <Bell size={20} />, badge: notifCount },
      { path: '/pagos', label: 'Historial', icon: <History size={20} /> },
      { path: '/pacientes', label: 'Pacientes', icon: <Users size={20} /> },
      { path: '/cobranzas', label: 'Cobranzas', icon: <Receipt size={20} /> },
    );
  }

  const rolLabels: Record<Rol, string> = {
    admin: 'Administrador',
    doctor: 'Doctor/a',
    secretaria: 'Secretaria',
  };

  const rolColors: Record<Rol, { color: string; bg: string }> = {
    admin:      { color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
    doctor:     { color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
    secretaria: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  };
  const rc = rolColors[rol] ?? rolColors.doctor;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Activity size={26} style={{ color: 'var(--primary)' }} />
            <span>Ventura Dental</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span style={{
                  background: '#ef4444', color: 'white',
                  fontSize: '0.7rem', fontWeight: 700,
                  padding: '1px 7px', borderRadius: '999px',
                  minWidth: '20px', textAlign: 'center'
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white', marginBottom: '4px' }}>
              {user?.nombre_completo}
            </div>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px',
              borderRadius: '999px', color: rc.color, background: rc.bg,
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              {rolLabels[rol]}
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
