import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { authService } from '../services';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const user = authService.getUser();
  
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
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* Selector de Tema */}
        <div className="theme-toggle" onClick={toggleTheme}>
          <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="nav-text">{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </div>

        <div className="nav-item logout" onClick={() => alert('Cerrando Sesión...')}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Cerrar Sesión</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
