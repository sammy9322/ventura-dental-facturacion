import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Search, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { pacienteService } from '../services';
import { Layout, Modal } from '../components';
import type { Paciente } from '../types';
import { useToast } from '../hooks/useToast';

const FORM_DRAFT_KEY = 'ventura_paciente_draft';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const form = useForm({
    defaultValues: { nombre: '', dni: '', telefono: '', email: '', direccion: '' },
  });

  // ── Persistencia del formulario en sessionStorage ───────────────────
  // Si el componente se desmonta (ej. al abrir otra pestaña y volver),
  // recuperamos los datos y el modal abierto.
  const restoreDraft = useCallback(() => {
    try {
      const saved = sessionStorage.getItem(FORM_DRAFT_KEY);
      if (!saved) return;
      const { formData } = JSON.parse(saved);
      if (formData) {
        form.reset(formData);
        setShowModal(true);
        setEditingPaciente(null);
      }
    } catch {
      sessionStorage.removeItem(FORM_DRAFT_KEY);
    }
  }, [form]);

  const saveDraft = useCallback((data: Record<string, any>) => {
    sessionStorage.setItem(FORM_DRAFT_KEY, JSON.stringify({ formData: data }));
  }, []);

  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(FORM_DRAFT_KEY);
  }, []);

  // Restaurar draft al montar el componente
  useEffect(() => {
    restoreDraft();
  }, [restoreDraft]);

  // Auto-guardar mientras se escribe (solo para nuevo paciente)
  const watchedData = form.watch();
  useEffect(() => {
    if (showModal && !editingPaciente) {
      saveDraft(watchedData);
    }
  }, [showModal, watchedData, editingPaciente, saveDraft]);

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

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPaciente(null);
    clearDraft();
    form.reset({ nombre: '', dni: '', telefono: '', email: '', direccion: '' });
  };

  const handleOpenModal = (paciente?: Paciente) => {
    if (paciente) {
      setEditingPaciente(paciente);
      clearDraft(); // no guardar draft cuando se edita
      form.reset({
        nombre: paciente.nombre,
        dni: paciente.dni || '',
        telefono: paciente.telefono || '',
        email: paciente.email || '',
        direccion: paciente.direccion || '',
      });
    } else {
      setEditingPaciente(null);
      // Si hay un draft guardado, restaurarlo en lugar de limpiar
      const saved = sessionStorage.getItem(FORM_DRAFT_KEY);
      if (saved) {
        try {
          const { formData } = JSON.parse(saved);
          if (formData) {
            form.reset(formData);
            setShowModal(true);
            return;
          }
        } catch { /* ignorar */ }
      }
      form.reset({ nombre: '', dni: '', telefono: '', email: '', direccion: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log('Submitting data:', data);
    try {
      if (editingPaciente) {
        await pacienteService.update(editingPaciente.id, data as any);
      } else {
        await pacienteService.create(data as any);
      }
      handleCloseModal();
      loadPacientes();
    } catch (error: any) {
      console.error('Error guardando paciente:', error);
      toast.error('Error al guardar el paciente: ' + (error?.response?.data?.error || error.message));
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
              placeholder="Buscar por nombre, cédula o teléfono..."
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
                  <th>Cédula</th>
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
        onClose={handleCloseModal}
        title={editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={() => form.handleSubmit(handleSubmit as any)()}>
              {editingPaciente ? 'Guardar Cambios' : 'Crear Paciente'}
            </button>
          </>
        }
      >
        <form id="paciente-form" onSubmit={form.handleSubmit(handleSubmit as any)}>
          <div className="form-group">
            <label className="form-label">Nombre Completo *</label>
            <input 
              type="text" 
              className="form-input" 
              {...form.register('nombre')} 
              required 
              placeholder="NOMBRE COMPLETO DEL PACIENTE" 
              style={{ textTransform: 'uppercase' }}
              onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase(); }}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cédula</label>
              <input type="text" className="form-input" {...form.register('dni')} maxLength={20} placeholder="Número de identificación" />
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
