import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { pacienteService, tratamientoService, tratamientoMacroService, authService } from '../services';
import { Layout, PacienteSearch } from '../components';
import type { Paciente, Tratamiento, DetallePagoItem, TratamientoMacro, TratamientoMicro, TipoMoneda } from '../types';
import { MONEDAS } from '../types';
import api from '../services/api';

export default function RegistrarPagoPage() {
  const navigate = useNavigate();
  const user = authService.getUser();

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [tratamientoPrincipal, setTratamientoPrincipal] = useState<Tratamiento | null>(null);
  const [tratamientosPaciente, setTratamientosPaciente] = useState<Tratamiento[]>([]);
  const [macroTratamientos, setMacroTratamientos] = useState<TratamientoMacro[]>([]);
  const [microTratamientos, setMicroTratamientos] = useState<TratamientoMicro[]>([]);
  const [concepto, setConcepto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [moneda, setMoneda] = useState<TipoMoneda>('CRC');
  const [detalles, setDetalles] = useState<DetallePagoItem[]>([
    { descripcion: '', monto: 0, es_cuota_principal: false }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarMacros();
  }, []);

  useEffect(() => {
    if (paciente) cargarTratamientos(paciente.id);
  }, [paciente]);

  const cargarMacros = async () => {
    try {
      const [macros, micros] = await Promise.all([
        tratamientoMacroService.getAll(),
        tratamientoMacroService.getAllMicro(),
      ]);
      const macrosUnicos = macros.filter((m, i, arr) => arr.findIndex(x => x.nombre === m.nombre) === i);
      const microsUnicos = micros.filter((m, i, arr) => arr.findIndex(x => 
        x.nombre === m.nombre && Number(x.macro_tratamiento_id) === Number(m.macro_tratamiento_id)
      ) === i);
      setMacroTratamientos(macrosUnicos);
      setMicroTratamientos(microsUnicos);
    } catch (err) { 
      console.error('Error cargando tratamientos:', err);
    }
  };

  const getMicrosByMacro = (macroId: number | string) => 
    microTratamientos.filter(m => Number(m.macro_tratamiento_id) === Number(macroId));

  const cargarTratamientos = async (pacienteId: number) => {
    try {
      const data = await tratamientoService.getAll({ pacienteId, estado: 'activo' });
      setTratamientosPaciente(data);
    } catch { /* */ }
  };

  const agregarItem = () => {
    setDetalles(prev => [...prev, { descripcion: '', monto: 0, es_cuota_principal: false }]);
  };

  const eliminarItem = (idx: number) => {
    setDetalles(prev => prev.filter((_, i) => i !== idx));
  };

  const actualizarItem = (idx: number, field: keyof DetallePagoItem, value: unknown) => {
    setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const marcarComoCuotaPrincipal = (idx: number) => {
    setDetalles(prev => prev.map((d, i) => ({
      ...d,
      es_cuota_principal: i === idx ? !d.es_cuota_principal : false,
    })));
  };

  const totalPago = detalles.reduce((s, d) => s + (Number(d.monto) || 0), 0);

  const saldoActualizado = () => {
    if (!tratamientoPrincipal) return null;
    const cuota = detalles.find(d => d.es_cuota_principal);
    const abono = cuota ? Number(cuota.monto) : 0;
    return tratamientoPrincipal.monto_total - tratamientoPrincipal.monto_pagado - abono;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paciente) return setError('Seleccione un paciente');
    if (detalles.length === 0 || detalles.every(d => !d.descripcion)) return setError('Agregue al menos un ítem');
    if (detalles.some(d => !d.descripcion || Number(d.monto) <= 0)) return setError('Complete todos los ítems correctamente');

    setError('');
    setSubmitting(true);
    try {
      await api.post('/pagos', {
        paciente_id: paciente.id,
        tratamiento_id: tratamientoPrincipal?.id || undefined,
        concepto: concepto || detalles.map(d => d.descripcion).join(', '),
        observaciones,
        moneda,
        detalles,
      });
      setSuccess(true);
      setTimeout(() => navigate('/pagos/registrar'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setSubmitting(false);
    }
  };

  const formatearMoneda = (n: number | string) => {
    const m = MONEDAS.find(x => x.value === moneda);
    return `${m?.simbolo || '₡'} ${Number(n).toFixed(2)}`;
  };

  const getSimbolo = () => MONEDAS.find(m => m.value === moneda)?.simbolo || '₡';

  if (success) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center' }}>
          <CheckCircle size={72} style={{ color: 'var(--brand-turquoise)' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}>¡Pago Registrado!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>La secretaria recibirá la notificación para cobrar y emitir el comprobante.</p>
          <button 
            className="btn btn-success" 
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setSuccess(false);
              setPaciente(null);
              setTratamientoPrincipal(null);
              setDetalles([{ descripcion: '', monto: 0, es_cuota_principal: false }]);
              setConcepto('');
              setObservaciones('');
            }}
          >
            Registrar otro pago
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Registrar Pago</h1>
        <p className="page-subtitle">El pago quedará pendiente hasta que la secretaria lo finalice</p>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={16} style={{ marginRight: 8 }} />{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

          <div className="card">
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <h3 className="card-title">Datos del Paciente</h3>
            </div>

            <PacienteSearch onSelect={(p) => { setPaciente(p); setTratamientoPrincipal(null); }} selectedPaciente={paciente} />

            {paciente && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 700, color: 'white', marginBottom: '4px' }}>{paciente.nombre}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DNI: {paciente.dni || 'N/A'} | Tel: {paciente.telefono || 'N/A'}</p>
              </div>
            )}

            {tratamientosPaciente.length > 0 && (
              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="form-label">Tratamiento Principal (Cuota)</label>
                <select
                  className="form-select"
                  value={tratamientoPrincipal?.id ?? ''}
                  onChange={e => {
                    const t = tratamientosPaciente.find(t => t.id === parseInt(e.target.value));
                    setTratamientoPrincipal(t || null);
                  }}
                >
                  <option value="">— Sin tratamiento principal —</option>
                  {tratamientosPaciente.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.macro_nombre || t.tipo} — Saldo: {formatearMoneda(t.monto_total - t.monto_pagado)}
                    </option>
                  ))}
                </select>
                {tratamientoPrincipal && (
                  <div style={{ marginTop: '0.75rem', padding: '0.875rem', background: 'rgba(15,23,42,0.5)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total del tratamiento:</span>
                      <span style={{ fontWeight: 600 }}>{formatearMoneda(tratamientoPrincipal.monto_total)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total abonado:</span>
                      <span style={{ fontWeight: 700, color: 'var(--brand-turquoise)', fontWeight: 600 }}>{formatearMoneda(tratamientoPrincipal.monto_pagado)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 700 }}>Saldo actual:</span>
                      <span style={{ fontWeight: 700, color: '#ef4444' }}>{formatearMoneda(tratamientoPrincipal.monto_total - tratamientoPrincipal.monto_pagado)}</span>
                    </div>
                    {saldoActualizado() !== null && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Saldo tras este pago:</span>
                        <span style={{ fontWeight: 700, color: saldoActualizado()! > 0 ? '#f59e0b' : 'var(--accent)' }}>
                          {formatearMoneda(Math.max(0, saldoActualizado()!))}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <h3 className="card-title">Ítems del Pago</h3>
              <button type="button" className="btn btn-outline btn-sm" onClick={agregarItem}>
                <PlusCircle size={15} /> Agregar
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Concepto General (opcional)</label>
              <input type="text" className="form-input" placeholder="Ej: Consulta + limpieza"
                value={concepto} onChange={e => setConcepto(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Moneda</label>
              <select
                className="form-select"
                value={moneda}
                onChange={e => setMoneda(e.target.value as TipoMoneda)}
              >
                {MONEDAS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {detalles.map((det, idx) => (
                <div key={idx} style={{
                  padding: '1rem', border: `1px solid ${det.es_cuota_principal ? 'rgba(97,49,146,0.4)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', background: det.es_cuota_principal ? 'rgba(97,49,146,0.05)' : 'rgba(15,23,42,0.3)',
                  position: 'relative'
                }}>
                  {det.es_cuota_principal && (
                    <span style={{ position: 'absolute', top: '-10px', left: '12px', fontSize: '0.65rem', fontWeight: 700, background: 'var(--brand-purple)', color: 'white', padding: '2px 10px', borderRadius: '999px' }}>
                      CUOTA PRINCIPAL
                    </span>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'start' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Proceso Clínico</label>
                      <select
                        className="form-select"
                        value={det.tratamiento_macro_id || ''}
                        onChange={e => {
                          const macroId = e.target.value ? parseInt(e.target.value) : undefined;
                          const nuevosDetalles = [...detalles];
                          nuevosDetalles[idx] = { 
                            ...nuevosDetalles[idx], 
                            tratamiento_macro_id: macroId,
                            tratamiento_micro_id: undefined, // Reset micro on macro change
                            descripcion: macroId ? macroTratamientos.find(m => Number(m.id) === Number(macroId))?.nombre || '' : '',
                            monto: 0
                          };
                          setDetalles(nuevosDetalles);
                        }}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <option value="">Seleccionar...</option>
                        {macroTratamientos.map(m => (
                          <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                      </select>
                      {det.tratamiento_macro_id && (
                        <>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Procedimiento Clínico</label>
                          <select
                            className="form-select"
                            value={det.tratamiento_micro_id || ''}
                            onChange={e => {
                              const microId = e.target.value ? parseInt(e.target.value) : undefined;
                              const micros = getMicrosByMacro(Number(det.tratamiento_macro_id));
                              const micro = microId ? micros.find(m => Number(m.id) === Number(microId)) : null;
                              const nuevoMonto = micro ? Number(micro.precio) : 0;
                              const nuevosDetalles = [...detalles];
                              nuevosDetalles[idx] = { 
                                ...nuevosDetalles[idx], 
                                tratamiento_micro_id: microId,
                                descripcion: micro?.nombre || '',
                                monto: nuevoMonto
                              };
                              setDetalles(nuevosDetalles);
                            }}
                            style={{ marginBottom: '0.5rem' }}
                          >
                            <option value="">Seleccionar procedimiento clínico...</option>
                             {getMicrosByMacro(det.tratamiento_macro_id).map(micro => (
                               <option key={micro.id} value={micro.id}>{micro.nombre} {Number(micro.precio) > 0 ? `(₡ ${Number(micro.precio).toFixed(2)})` : ''}</option>
                             ))}
                          </select>
                        </>
                      )}
                      {!det.tratamiento_macro_id && (
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Descripción (si no hay micro)"
                          value={det.descripcion}
                          onChange={e => actualizarItem(idx, 'descripcion', e.target.value)}
                          style={{ marginBottom: '0.5rem' }}
                        />
                      )}
                      <div style={{ display: 'flex', alignItems: 'stretch', width: '100%', maxWidth: '180px' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: '#1e293b', 
                          border: '1px solid #334155', 
                          borderRight: 'none', 
                          borderRadius: '8px 0 0 8px',
                          padding: '0 14px',
                          minWidth: '44px',
                          color: '#f1f5f9',
                          fontWeight: 700,
                          fontSize: '16px'
                        }}>{getSimbolo()}</div>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={det.monto}
                          onChange={e => actualizarItem(idx, 'monto', parseFloat(e.target.value) || 0)}
                          style={{ borderRadius: '0 8px 8px 0', flex: 1 }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1.5rem' }}>
                      {detalles.length > 1 && (
                        <button type="button" onClick={() => eliminarItem(idx)} title="Eliminar"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#ef4444' }}>
                          <Trash2 size={15} />
                        </button>
                      )}
                      {tratamientoPrincipal && (
                        <button type="button" onClick={() => marcarComoCuotaPrincipal(idx)} title="Marcar como cuota principal"
                          style={{
                            background: det.es_cuota_principal ? 'rgba(97,49,146,0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${det.es_cuota_principal ? 'rgba(97,49,146,0.5)' : 'var(--border)'}`,
                            borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: det.es_cuota_principal ? 'var(--brand-purple-light)' : 'var(--text-muted)',
                            fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.3
                          }}>
                          {det.es_cuota_principal ? '✓ Cuota' : 'Cuota?'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Observaciones</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Observaciones adicionales..."
                      value={det.observaciones || ''}
                      onChange={e => actualizarItem(idx, 'observaciones', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Observaciones Generales</label>
              <textarea
                className="form-input"
                placeholder="Observaciones adicionales del pago..."
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                rows={2}
              />
            </div>

            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>TOTAL A REGISTRAR</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-purple-light)' }}>
                {getSimbolo()} {Number(totalPago).toFixed(2)}
              </span>
            </div>

            <button type="submit" className="btn btn-success btn-lg" style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }} disabled={submitting || !paciente}>
              {submitting ? 'Registrando...' : '📋 Registrar Pago (Notificar a Secretaria)'}
            </button>
          </div>
        </div>
      </form>
    </Layout>
  );
}
