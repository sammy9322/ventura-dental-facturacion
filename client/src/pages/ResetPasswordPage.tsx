import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="alert alert-error">Token de recuperación no válido.</div>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/login" style={{ color: 'var(--brand-turquoise)' }}>Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h2 style={{ margin: 0, color: 'var(--brand-purple)' }}>Nueva Contraseña</h2>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Nueva Contraseña</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Contraseña</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--brand-turquoise)', fontSize: '0.875rem' }}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
