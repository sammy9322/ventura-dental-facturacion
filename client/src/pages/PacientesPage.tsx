import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Search, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { pacienteService } from '../services';
import { Layout, Modal } from '../components';
import type { Paciente } from '../types';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm({
    defaultValues: { nombre: '', dni: '', telefono: '', email: '', direccion: '' },
  });

  useEffect(() => { loadPacientes(); }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) searchPacientes();
    else if (searchQuery.length === 0) loadPacientes();
  }, [searchQuery]);

  const loadPacientes = async () => {
    try {
      const data = await pacienteService.getAll();
      setPacientes(data);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPacientes = async () => {
    try {
      const data = await pacienteService.search(searchQuery);
      setPacientes(data);
    } catch (error) {
      console.error('Error buscando pacientes:', error);
    }
  };

  const handleOpenModal = (paciente?: Paciente) => {
    if (paciente) {
      setEditingPaciente(paciente);
      form.reset({
        nombre: paciente.nombre,
        dni: paciente.dni || '',
        telefono: paciente.telefono || '',
        email: paciente.email || '',
        direccion: paciente.direccion || '',
      });
    } else {
      setEditingPaciente(null);
      form.reset({ nombre: '', dni: '', telefono: '', email: '', direccion: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (editingPaciente) {
        await pacienteService.update(editingPaciente.id, data as any);
      } else {
        await pacienteService.create(data as any);
      }
      setShowModal(false);
      loadPacientes();
    } catch (error) {
      console.error('Error guardando paciente:', error);
      alert('Error al guardar el paciente');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de desactivar este paciente?')) return;
    try {
      await pacienteService.delete(id);
      loadPacientes();
    } catch (error) {
      console.error('Error eliminando paciente:', error);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Pacientes</h1>
            <p className="page-subtitle">{pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} registrado{pacientes.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <UserPlus size={18} /> Nuevo Paciente
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="filtros-bar">
        <div className="filtro-item" style={{ flex: 1, maxWidth: 420 }}>
          <label className="filtro-label"><Search size={14} style={{ marginRight: 4 }} />Buscar</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute', left: '0.875rem', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              className="filtro-date"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              placeholder="Buscar por nombre, DNI o teléfono..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : pacientes.length === 0 ? (
        <div className="empty-state">
          <h3>No hay pacientes registrados</h3>
          <p>Agregue su primer paciente</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => handleOpenModal()}>
            <UserPlus size={18} /> Agregar Paciente
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Dirección</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map(paciente => (
                  <tr key={paciente.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{paciente.nombre}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{paciente.dni || '—'}</td>
                    <td>{paciente.telefono || '—'}</td>
                    <td style={{ color: 'var(--primary-light)', fontSize: '0.875rem' }}>{paciente.email || '—'}</td>
                    <td style={{ maxWidth: '200px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{paciente.direccion || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleOpenModal(paciente)}>
                          <Pencil size={13} /> Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(paciente.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={form.handleSubmit(handleSubmit as any)}>
              {editingPaciente ? 'Guardar Cambios' : 'Crear Paciente'}
            </button>
          </>
        }
      >
        <form onSubmit={form.handleSubmit(handleSubmit as any)}>
          <div className="form-group">
            <label className="form-label">Nombre Completo *</label>
            <input type="text" className="form-input" {...form.register('nombre')} required placeholder="Nombre completo del paciente" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">DNI</label>
              <input type="text" className="form-input" {...form.register('dni')} maxLength={8} placeholder="00000000" />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input type="tel" className="form-input" {...form.register('telefono')} placeholder="9XX XXX XXX" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" {...form.register('email')} placeholder="correo@ejemplo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Dirección</label>
            <textarea className="form-textarea" rows={2} {...form.register('direccion')} placeholder="Dirección completa" />
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
