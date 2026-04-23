import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { authService } from '../services';
import { Layout, Modal } from '../components';
import type { Usuario } from '../types';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');

  const form = useForm({
    defaultValues: {
      username: '',
      nombre_completo: '',
      rol: 'doctor' as 'admin' | 'doctor' | 'secretaria',
    },
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const data = await authService.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      form.reset({
        username: usuario.username,
        nombre_completo: usuario.nombre_completo,
        rol: usuario.rol,
      });
    } else {
      setEditingUsuario(null);
      form.reset({
        username: '',
        nombre_completo: '',
        rol: 'doctor',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (editingUsuario) {
        await fetch(`/api/auth/usuarios/${editingUsuario.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(data),
        });
      } else {
        await authService.createUsuario({
          username: data.username as string,
          nombre_completo: data.nombre_completo as string,
          rol: (data.rol as string) as 'admin' | 'doctor' | 'secretaria',
          password: 'password123',
        });
      }
      setShowModal(false);
      loadUsuarios();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      alert('Error al guardar el usuario');
    }
  };

  const handleToggleActivo = async (usuario: Usuario) => {
    try {
      await fetch(`/api/auth/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ activo: !usuario.activo }),
      });
      loadUsuarios();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      await fetch(`/api/auth/usuarios/${editingUsuario?.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ newPassword: passwordData.newPassword }),
      });
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      alert('Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      setPasswordError('Error al cambiar la contraseña');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Gestión de Usuarios</h1>
        <p className="page-subtitle">Administrar usuarios del sistema</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Lista de Usuarios</h3>
          <button className="btn btn-success" onClick={() => handleOpenModal()}>
            + Nuevo Usuario
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td style={{ fontFamily: 'monospace' }}>{usuario.username}</td>
                  <td>{usuario.nombre_completo}</td>
                  <td>
                    <span
                      className={`badge ${
                        usuario.rol === 'admin' ? 'badge-info' : 'badge-success'
                      }`}
                    >
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${usuario.activo ? 'badge-success' : 'badge-danger'}`}
                    >
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenModal(usuario)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setEditingUsuario(usuario);
                          setShowPasswordModal(true);
                        }}
                      >
                        Contraseña
                      </button>
                      <button
                        className={`btn btn-sm ${
                          usuario.activo ? 'btn-danger' : 'btn-success'
                        }`}
                        onClick={() => handleToggleActivo(usuario)}
                      >
                        {usuario.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={form.handleSubmit(handleSubmit)}>
              {editingUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </>
        }
      >
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="form-group">
            <label className="form-label">Nombre de Usuario *</label>
            <input
              type="text"
              className="form-input"
              {...form.register('username')}
              required
              disabled={!!editingUsuario}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre Completo *</label>
            <input
              type="text"
              className="form-input"
              {...form.register('nombre_completo')}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Rol *</label>
            <select className="form-select" {...form.register('rol')}>
              <option value="admin">Administrador</option>
              <option value="doctor">Doctor/a</option>
              <option value="secretaria">Secretaria</option>
            </select>
          </div>
          {!editingUsuario && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              La contraseña inicial será: password123
            </p>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ newPassword: '', confirmPassword: '' });
          setPasswordError('');
        }}
        title={`Cambiar Contraseña - ${editingUsuario?.nombre_completo}`}
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ newPassword: '', confirmPassword: '' });
                setPasswordError('');
              }}
            >
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleChangePassword}>
              Actualizar Contraseña
            </button>
          </>
        }
      >
        {passwordError && <div className="alert alert-error">{passwordError}</div>}
        <div className="form-group">
          <label className="form-label">Nueva Contraseña</label>
          <input
            type="password"
            className="form-input"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirmar Contraseña</label>
          <input
            type="password"
            className="form-input"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
        </div>
      </Modal>
    </Layout>
  );
}
