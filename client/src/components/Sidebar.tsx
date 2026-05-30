import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { authService } from '../services';
import api from '../services/api';
import LogoOficial from '../assets/logo_oficial.png';
import { Modal } from '../components';
import { useToast } from '../hooks/useToast';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [notifCount, setNotifCount] = useState(0);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdData, setPwdData] = useState({ newPassword: '', confirmPassword: '' });
  const [pwdError, setPwdError] = useState('');

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

  const handleChangePassword = async () => {
    setPwdError('');
    if (pwdData.newPassword.length < 6) {
      setPwdError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError('Las contraseñas no coinciden');
      return;
    }
    try {
      await api.put(`/auth/usuarios/${user?.id}/password`, { newPassword: pwdData.newPassword });
      toast.success('Contraseña actualizada correctamente');
      setShowChangePwd(false);
      setPwdData({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPwdError(err.response?.data?.error || 'Error al cambiar la contraseña');
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['admin'] },
    { name: 'Cobros', path: '/cobros/pendientes', icon: '💰', roles: ['secretaria', 'admin'] },
    { name: 'Pacientes', path: '/pacientes', icon: '👥', roles: ['admin', 'doctor', 'secretaria'] },
    { name: 'Tratamientos', path: '/tratamientos', icon: '🦷', roles: ['admin', 'doctor'] },
    { name: 'Procesos Clínicos', path: '/macro-tratamientos', icon: '⚙️', roles: ['admin'] },
    { name: 'Registro e Historial de pagos', path: '/pagos', icon: '📜', roles: ['admin', 'secretaria', 'doctor'] },
    { name: 'Cierre de Caja', path: '/cierre-caja', icon: '🏦', roles: ['admin', 'secretaria'] },
    { name: 'Usuarios', path: '/usuarios', icon: '👤', roles: ['admin'] },
    { name: 'Auditoría', path: '/auditoria', icon: '🛡️', roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.rol))
  );

  return (
    <>
      <aside className="sidebar panel-cristal">
      <div className="sidebar-header">
        <img src={LogoOficial} alt="Ventura Dental" className="sidebar-logo-img" />
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

        <div className="nav-item" onClick={() => setShowChangePwd(true)}>
          <span className="nav-icon">🔑</span>
          <span className="nav-text">Cambiar mi Contraseña</span>
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
      <Modal
        isOpen={showChangePwd}
        onClose={() => { setShowChangePwd(false); setPwdError(''); setPwdData({ newPassword: '', confirmPassword: '' }); }}
        title="Cambiar mi Contraseña"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => { setShowChangePwd(false); setPwdError(''); setPwdData({ newPassword: '', confirmPassword: '' }); }}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleChangePassword}>
              Actualizar
            </button>
          </>
        }
      >
        {pwdError && <div className="alert alert-error">{pwdError}</div>}
        <div className="form-group">
          <label className="form-label">Nueva Contraseña</label>
          <input
            type="password"
            className="form-input"
            value={pwdData.newPassword}
            onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirmar Contraseña</label>
          <input
            type="password"
            className="form-input"
            value={pwdData.confirmPassword}
            onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
            placeholder="Repite la contraseña"
          />
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
