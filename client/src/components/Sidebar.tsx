import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext'; // Ajustar ruta segun sea necesario
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Pacientes', path: '/pacientes', icon: '👥' },
    { name: 'Tratamientos', path: '/tratamientos', icon: '🦷' },
    { name: 'Historial', path: '/pagos', icon: '📜' },
    { name: 'Auditoría', path: '/auditoria', icon: '🛡️', adminOnly: true },
  ];

  return (
    <aside className="sidebar panel-cristal">
      <div className="sidebar-logo">
        <h2 className="neon-text">Ventura Dental</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
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
