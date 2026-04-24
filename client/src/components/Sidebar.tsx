import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { authService } from '../services';
import api from '../services/api';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [notifCount, setNotifCount] = useState(0);

  const user = authService.getUser();

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
  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['admin'] },
    { name: 'Cobros', path: '/cobros/pendientes', icon: '💰', roles: ['secretaria', 'admin'] },
    { name: 'Pacientes', path: '/pacientes', icon: '👥', roles: ['admin', 'doctor', 'secretaria'] },
    { name: 'Tratamientos', path: '/tratamientos', icon: '🦷', roles: ['admin', 'doctor'] },
    { name: 'Historial', path: '/pagos', icon: '📜', roles: ['admin', 'secretaria'] },
    { name: 'Cierre de Caja', path: '/cierre-caja', icon: '🏦', roles: ['admin', 'secretaria'] },
    { name: 'Auditoría', path: '/auditoria', icon: '🛡️', roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.rol))
  );

  return (
    <aside className="sidebar panel-cristal">
      <div className="sidebar-logo">
        <h2 className="neon-text">Ventura Dental</h2>
      </div>

      <nav className="sidebar-nav">
        {filteredItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            style={{ position: 'relative' }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
            {item.path === '/cobros/pendientes' && notifCount > 0 && (
              <span className="badge-notif">{notifCount}</span>
            )}
          </div>
        ))}

        {/* Botón de tema — solo visible en móvil (≤640px via CSS) */}
        <div className="mobile-theme-btn" onClick={toggleTheme} style={{ display: 'none' }}>
          <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
          <span>Tema</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        {/* Selector de Tema — visible en desktop/tablet */}
        <div className="nav-item theme-toggle-container" onClick={toggleTheme} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span className="nav-icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span className="nav-text">Apariencia</span>
          </div>
          <div className={`theme-switch ${theme === 'dark' ? 'active' : ''}`}>
            <div className="theme-switch-knob" />
          </div>
        </div>

        <div className="nav-item logout" onClick={() => {
          authService.logout();
          navigate('/login');
        }}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Cerrar Sesión</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
