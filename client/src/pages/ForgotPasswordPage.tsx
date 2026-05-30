import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h2 style={{ margin: 0, color: 'var(--brand-purple)' }}>Recuperar Contraseña</h2>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Ingresa tu correo electrónico registrado
          </p>
        </div>

        {sent ? (
          <div className="alert alert-success" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>¡Correo enviado!</p>
            <p style={{ fontSize: '0.875rem' }}>Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--brand-turquoise)', fontSize: '0.875rem' }}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
