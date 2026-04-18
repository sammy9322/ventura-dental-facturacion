import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Activity, PlusCircle, Pencil, XCircle, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { tratamientoService, tratamientoMacroService } from '../services';
import { Layout, Modal, PacienteSearch } from '../components';
import type { Tratamiento, Paciente, TratamientoMacro } from '../types';
import { TIPOS_TRATAMIENTO as TIPOS_EXT } from '../types';

// Eliminamos la lista estática TIPOS_TRATAMIENTO

export default function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTratamiento, setEditingTratamiento] = useState<Tratamiento | null>(null);
  const [macroTratamientos, setMacroTratamientos] = useState<TratamientoMacro[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [filters, setFilters] = useState({ tipo: '', estado: '' });
  
  // Feedback & Confirmación
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm({
    defaultValues: {
      tipo: '',
      descripcion: '',
      monto_total: 0,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
    },
  });

  useEffect(() => { 
    loadTratamientos(); 
    loadMacros();
  }, [filters]);

  const loadMacros = async () => {
    try {
      const data = await tratamientoMacroService.getAll();
      // Deduplicar por nombre (por seguridad extra)
      const unicos = data.filter((m, i, arr) => arr.findIndex(x => x.nombre === m.nombre) === i);
      setMacroTratamientos(unicos);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  };

  const loadTratamientos = async () => {
    try {
      const data = await tratamientoService.getAll(filters);
      setTratamientos(data);
    } catch (error) {
      console.error('Error cargando tratamientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tratamiento?: Tratamiento) => {
    if (tratamiento) {
      setEditingTratamiento(tratamiento);
      setSelectedPaciente({
        id: tratamiento.paciente_id,
        nombre: tratamiento.paciente_nombre || '',
        dni: tratamiento.paciente_dni ? String(tratamiento.paciente_dni) : null,
        telefono: null, email: null, direccion: null,
        activo: true, created_at: '', updated_at: '',
      });
      form.reset({
        tipo: tratamiento.tipo,
        descripcion: tratamiento.descripcion || '',
        monto_total: tratamiento.monto_total,
        fecha_inicio: tratamiento.fecha_inicio.split('T')[0],
        fecha_fin: tratamiento.fecha_fin ? tratamiento.fecha_fin.split('T')[0] : '',
      });
    } else {
      setEditingTratamiento(null);
      setSelectedPaciente(null);
      form.reset({ 
        tipo: '',
        descripcion: '', 
        monto_total: 0, 
        fecha_inicio: new Date().toISOString().split('T')[0], 
        fecha_fin: '' 
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!selectedPaciente) { alert('Seleccione un paciente'); return; }
    try {
      const macroSeleccionado = macroTratamientos.find(m => m.nombre === data.tipo);
      
      if (editingTratamiento) {
        await tratamientoService.update(editingTratamiento.id, {
          tipo: data.tipo as string,
          macro_tratamiento_id: macroSeleccionado?.id,
          descripcion: data.descripcion as string,
          monto_total: Number(data.monto_total),
          fecha_inicio: data.fecha_inicio as string,
          fecha_fin: (data.fecha_fin as string) || undefined,
        });
      } else {
        await tratamientoService.create({
          paciente_id: selectedPaciente.id,
          tipo: data.tipo as string,
          macro_tratamiento_id: macroSeleccionado?.id,
          descripcion: data.descripcion as string,
          monto_total: Number(data.monto_total),
          fecha_inicio: data.fecha_inicio as string,
          fecha_fin: (data.fecha_fin as string) || undefined,
        });
      }
      setSuccessMsg(editingTratamiento ? 'Tratamiento actualizado correctamente' : 'Tratamiento creado exitosamente');
      setShowModal(false);
      loadTratamientos();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error: any) {
      console.error('Error guardando tratamiento:', error);
      setErrorMsg(error.response?.data?.error || 'Error al guardar el tratamiento');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setErrorMsg('');
    try {
      await tratamientoService.delete(deletingId);
      setSuccessMsg('Tratamiento cancelado correctamente');
      setShowConfirmDelete(false);
      setDeletingId(null);
      loadTratamientos();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error: any) {
      console.error('Error eliminando tratamiento:', error);
      setErrorMsg(error.response?.data?.error || 'Error al cancelar el tratamiento');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (value: number) =>
    `₡ ${Number(value).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  const getTipoLabel = (tipo: string) =>
    macroTratamientos.find(t => t.nombre === tipo)?.nombre || tipo;

  const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
    activo:     { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'Activo'     },
    completado: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: 'Completado' },
    cancelado:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Cancelado'  },
  };

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Planes de Tratamiento</h1>
            <p className="page-subtitle">Gestión de procesos y procedimientos clínicos</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <PlusCircle size={18} /> Nuevo Tratamiento
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      {successMsg && (
        <div className="alert alert-success fadeIn" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error fadeIn" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}
      <div className="card filters-card" style={{ marginBottom: '2rem' }}>
        <div className="filters-grid">
          <div className="filtro-item">
            <label className="filtro-label"><Filter size={14} style={{ marginRight: 4 }} />Proceso Clínico</label>
            <select className="filtro-select" value={filters.tipo} onChange={e => setFilters({ ...filters, tipo: e.target.value })}>
              <option value="">Todos</option>
              {macroTratamientos.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="filtro-item">
            <label className="filtro-label"><Filter size={14} style={{ marginRight: 4 }} />Estado</label>
            <select className="filtro-select" value={filters.estado} onChange={e => setFilters({ ...filters, estado: e.target.value })}>
              <option value="">Todos</option>
              <option value="activo">✅ Activo</option>
              <option value="completado">✔ Completado</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : tratamientos.length === 0 ? (
        <div className="empty-state">
          <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3>No hay tratamientos registrados</h3>
          <p>Agregue el primer tratamiento</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Tipo</th>
                  <th>Total</th>
                  <th>Pagado</th>
                  <th>Saldo</th>
                  <th>Inicio</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tratamientos.map((t) => {
                  const saldo = t.monto_total - t.monto_pagado;
                  const est = estadoConfig[t.estado] || estadoConfig.activo;
                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t.paciente_nombre}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DNI: {t.paciente_dni || 'N/A'}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{getTipoLabel(t.tipo)}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(t.monto_total)}</td>
                      <td style={{ color: '#10b981' }}>{formatCurrency(t.monto_pagado)}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: saldo > 0 ? '#ef4444' : '#10b981' }}>
                          {formatCurrency(saldo)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{formatDate(t.fecha_inicio)}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: '999px',
                          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
                          color: est.color, background: est.bg, border: `1px solid ${est.color}40`,
                        }}>
                          {est.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleOpenModal(t)}>
                            <Pencil size={13} /> Editar
                          </button>
                          {t.estado === 'activo' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(t.id)}>
                              <XCircle size={13} /> Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTratamiento ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
        size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={form.handleSubmit(handleSubmit as any)}>
              {editingTratamiento ? 'Guardar Cambios' : 'Crear Tratamiento'}
            </button>
          </>
        }
      >
        <form onSubmit={form.handleSubmit(handleSubmit as any)}>
          {!editingTratamiento && (
            <div className="form-group">
              <label className="form-label">Paciente *</label>
              <PacienteSearch onSelect={(p) => setSelectedPaciente(p)} selectedPaciente={selectedPaciente} />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Proceso Clínico *</label>
              <select className="form-select" {...form.register('tipo')} required>
                <option value="">Seleccionar...</option>
                {macroTratamientos.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monto Total (₡) *</label>
              <input type="number" step="0.01" min="0" className="form-input"
                {...form.register('monto_total', { valueAsNumber: true })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" rows={3} {...form.register('descripcion')}
              placeholder="Detalles del tratamiento..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha de Inicio *</label>
              <input type="date" className="form-input" {...form.register('fecha_inicio')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de Fin</label>
              <input type="date" className="form-input" {...form.register('fecha_fin')} />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Cancelación */}
      <Modal
        isOpen={showConfirmDelete}
        onClose={() => !isDeleting && setShowConfirmDelete(false)}
        title="Confirmar Cancelación"
        size="sm"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowConfirmDelete(false)} disabled={isDeleting}>
              No, Mantener
            </button>
            <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Cancelando...' : 'Sí, Cancelar Plan'}
            </button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'rgba(239,68,68,0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            color: '#ef4444'
          }}>
            <AlertCircle size={32} />
          </div>
          <h3 style={{ marginBottom: '0.5rem', color: 'white' }}>¿Estás seguro?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Esta acción marcará el plan de tratamiento como <strong>Cancelado</strong>. No se podrán registrar más pagos a este plan.
          </p>
        </div>
      </Modal>
    </Layout>
  );
}
