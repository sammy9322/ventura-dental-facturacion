import { useState, useEffect } from 'react';
import { Layout } from '../components';
import { tratamientoMacroService } from '../services';
import type { TratamientoMacro, TratamientoMicro } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Settings2, 
  Stethoscope, 
  Layers,
  Save,
  Clock
} from 'lucide-react';

export default function MacroTratamientosPage() {
  const [macros, setMacros] = useState<TratamientoMacro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedMacroId, setSelectedMacroId] = useState<number | null>(null);
  
  // Forms
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [editingMacro, setEditingMacro] = useState<TratamientoMacro | null>(null);
  const [macroForm, setMacroForm] = useState({ nombre: '', descripcion: '' });
  
  const [showMicroInline, setShowMicroInline] = useState(false);
  const [microForm, setMicroForm] = useState({ macro_tratamiento_id: 0, nombre: '', descripcion: '', precio: 0 });
  const [editingMicroId, setEditingMicroId] = useState<number | null>(null);
  
  const [saving, setSaving] = useState(false);

  const loadMacros = async () => {
    try {
      const data = await tratamientoMacroService.getAll();
      const macrosWithMicros = await Promise.all(
        data.map(async (m) => {
          const full = await tratamientoMacroService.getById(m.id);
          return full;
        })
      );
      setMacros(macrosWithMicros);
      // Mantener selección si existe
      if (selectedMacroId === null && macrosWithMicros.length > 0) {
        setSelectedMacroId(macrosWithMicros[0].id);
      }
    } catch { /* */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMacros(); }, []);

  const selectedMacro = macros.find(m => m.id === selectedMacroId);

  const handleSaveMacro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!macroForm.nombre.trim()) return setError('El nombre es requerido');
    setError('');
    setSaving(true);
    try {
      if (editingMacro) {
        await tratamientoMacroService.update(editingMacro.id, macroForm);
        setSuccessMsg('Proceso clínico actualizado');
      } else {
        await tratamientoMacroService.create(macroForm);
        setSuccessMsg('Proceso clínico creado');
      }
      setShowMacroModal(false);
      loadMacros();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMacro = async (id: number) => {
    if (!confirm('¿Inactivar este proceso clínico? Todos sus procedimientos se ocultarán.')) return;
    try {
      await tratamientoMacroService.delete(id);
      setSuccessMsg('Proceso clínico inactivado');
      if (selectedMacroId === id) setSelectedMacroId(null);
      loadMacros();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { setError('Error al eliminar'); }
  };

  const handleSaveMicro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!microForm.nombre.trim()) return setError('El nombre es requerido');
    setError('');
    setSaving(true);
    try {
      if (editingMicroId) {
        await tratamientoMacroService.updateMicro(editingMicroId, microForm);
        setSuccessMsg('Procedimiento clínico actualizado');
      } else {
        await tratamientoMacroService.createMicro({ ...microForm, macro_tratamiento_id: selectedMacroId! });
        setSuccessMsg('Procedimiento clínico creado');
      }
      setShowMicroInline(false);
      setMicroForm({ macro_tratamiento_id: 0, nombre: '', descripcion: '', precio: 0 });
      setEditingMicroId(null);
      loadMacros();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMicro = async (id: number) => {
    if (!confirm('¿Inactivar este procedimiento clínico?')) return;
    try {
      await tratamientoMacroService.deleteMicro(id);
      setSuccessMsg('Procedimiento clínico inactivado');
      loadMacros();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { setError('Error al eliminar'); }
  };

  if (loading) return <Layout><div className="loading"><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="grid-catalog" style={{ 
        height: 'calc(100vh - 180px)',
        alignItems: 'stretch'
      }}>
        
        {/* PANEL IZQUIERDO: Sidebar de Procesos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Estructura Clínica</h1>
              <p className="page-subtitle">Principales Procesos</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => {
              setEditingMacro(null);
              setMacroForm({ nombre: '', descripcion: '' });
              setShowMacroModal(true);
            }}>
              <Plus size={16} />
            </button>
          </div>

          <div className="card" style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', background: 'rgba(15,23,42,0.4)' }}>
            {macros.map(m => (
              <div 
                key={m.id} 
                className={`sidebar-item ${selectedMacroId === m.id ? 'active' : ''}`}
                onClick={() => setSelectedMacroId(m.id)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  marginBottom: '0.75rem',
                  background: selectedMacroId === m.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedMacroId === m.id ? 'rgba(59,130,246,0.4)' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Layers size={18} style={{ color: selectedMacroId === m.id ? 'var(--primary-light)' : 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: selectedMacroId === m.id ? 'white' : 'var(--text-secondary)' }}>{m.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {m.micros?.length || 0} procedimientos
                    </div>
                  </div>
                </div>
                {selectedMacroId === m.id && <ChevronRight size={18} style={{ color: 'white' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* PANEL DERECHO: Detalle y Procedimientos */}
        <div className="card" style={{ 
          margin: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          background: 'rgba(15,23,42,0.2)',
          border: '1px solid var(--border)'
        }}>
          {selectedMacro ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Header de Detalle */}
              <div style={{ 
                padding: '1.5rem', 
                borderBottom: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Settings2 size={16} style={{ color: 'var(--primary-light)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Configuración de Proceso
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>{selectedMacro.nombre}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedMacro.descripcion || 'Sin descripción adicional.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => {
                    setEditingMacro(selectedMacro);
                    setMacroForm({ nombre: selectedMacro.nombre, descripcion: selectedMacro.descripcion || '' });
                    setShowMacroModal(true);
                  }}>
                    <Edit2 size={14} /> Editar
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMacro(selectedMacro.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Lista de Procedimientos */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Procedimientos Clínicos</h3>
                  {!showMicroInline && (
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      setEditingMicroId(null);
                      setMicroForm({ macro_tratamiento_id: selectedMacro.id, nombre: '', descripcion: '', precio: 0 });
                      setShowMicroInline(true);
                    }}>
                      <Plus size={16} /> Agregar Procedimiento
                    </button>
                  )}
                </div>

                {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}><CheckCircle size={16} /> {successMsg}</div>}
                {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={16} /> {error}</div>}

                {/* Formulario Inline para Procedimiento */}
                {showMicroInline && (
                  <div className="card" style={{ 
                    background: 'rgba(59,130,246,0.05)', 
                    border: '1px dashed var(--primary)',
                    marginBottom: '1.5rem',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{editingMicroId ? 'Editar' : 'Nuevo'} Procedimiento</h4>
                      <button onClick={() => setShowMicroInline(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                    <form onSubmit={handleSaveMicro} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Nombre del Procedimiento</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={microForm.nombre} 
                          onChange={e => setMicroForm({ ...microForm, nombre: e.target.value })}
                          placeholder="Ej: Brackets Metalicos"
                          autoFocus
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Precio (₡)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={microForm.precio} 
                          onChange={e => setMicroForm({ ...microForm, precio: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Descripción (Opcional)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={microForm.descripcion} 
                          onChange={e => setMicroForm({ ...microForm, descripcion: e.target.value })}
                          placeholder="Detalles sobre este procedimiento..."
                        />
                      </div>
                      <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowMicroInline(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                          <Save size={14} /> {saving ? 'Guardando...' : 'Guardar Procedimiento'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedMacro.micros?.map(micro => (
                    <div key={micro.id} className="micro-item" style={{
                      padding: '1rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'transform 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '10px', 
                          background: 'rgba(59,130,246,0.1)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--primary-light)'
                        }}>
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'white' }}>{micro.nombre}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{micro.descripcion || 'Sin descripción'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>₡ {Number(micro.precio).toLocaleString()}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Precio Sugerido</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-outline btn-sm" style={{ padding: '6px' }} onClick={() => {
                            setEditingMicroId(micro.id);
                            setMicroForm({ 
                              macro_tratamiento_id: selectedMacro.id, 
                              nombre: micro.nombre, 
                              descripcion: micro.descripcion || '', 
                              precio: micro.precio || 0 
                            });
                            setShowMicroInline(true);
                          }}>
                            <Edit2 size={12} />
                          </button>
                          <button className="btn btn-outline btn-sm" style={{ padding: '6px', color: '#ef4444' }} onClick={() => handleDeleteMicro(micro.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedMacro.micros || selectedMacro.micros.length === 0) && !showMicroInline && (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)' }}>
                      <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                      <p>No hay procedimientos en este proceso.</p>
                      <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => setShowMicroInline(true)}>
                        Agregar el primer procedimiento
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--text-muted)',
              padding: '2rem'
            }}>
              <Layers size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Seleccione un proceso</h3>
              <p>Haga clic en un proceso de la izquierda para gestionar sus procedimientos y precios.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear/Editar Proceso (Sigue siendo modal para no saturar el sidebar) */}
      {showMacroModal && (
        <div className="modal-overlay" onClick={() => setShowMacroModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMacro ? 'Editar' : 'Nuevo'} Proceso Clínico</h3>
              <button className="modal-close" onClick={() => setShowMacroModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveMacro}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre del Proceso *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={macroForm.nombre} 
                    onChange={e => setMacroForm({ ...macroForm, nombre: e.target.value })} 
                    placeholder="Ej: Odontopediatría" 
                    autoFocus 
                  />
                  <p className="form-help">Esto agrupará todos los procedimientos clínicos relacionados.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción Global</label>
                  <textarea 
                    className="form-input" 
                    value={macroForm.descripcion} 
                    onChange={e => setMacroForm({ ...macroForm, descripcion: e.target.value })} 
                    placeholder="Breve descripción de los alcances de este proceso..." 
                    rows={3} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowMacroModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editingMacro ? 'Actualizar Proceso' : 'Crear Proceso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
