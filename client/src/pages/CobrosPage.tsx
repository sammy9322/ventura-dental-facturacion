import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, User, Stethoscope, DollarSign, Send, MessageCircle } from 'lucide-react';
import { Layout, SignaturePad } from '../components';
import { METODOS_PAGO } from '../types';
import type { Pago, MetodoPago } from '../types';
import api from '../services/api';

export default function CobrosPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Pago | null>(null);
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
  const [firma, setFirma] = useState('');
  const [enviarEmail, setEnviarEmail] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [doneId, setDoneId] = useState<number | null>(null);

  const { data: pendientes = [], isLoading } = useQuery<Pago[]>({
    queryKey: ['cobros-pendientes'],
    queryFn: async () => (await api.get('/pagos/pendientes')).data,
    refetchInterval: 15000,
  });

  const formatMoney = (n: number | string, moneda: string = 'CRC') => {
    const symbol = moneda === 'USD' ? '$' : '₡';
    return `${symbol} ${Number(n).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const handleFinalizar = async () => {
    if (!selected) return;
    setFinalizing(true);
    try {
      await api.put(`/pagos/${selected.id}/finalizar`, {
        metodo_pago: metodo,
        firma_dataurl: firma || undefined,
        enviar_email: enviarEmail,
      });
      setDoneId(selected.id);
      setSelected(null);
      setFirma('');
      qc.invalidateQueries({ queryKey: ['cobros-pendientes'] });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al finalizar pago');
    } finally {
      setFinalizing(false);
    }
  };

  // WhatsApp link
  const waLink = (pago: Pago) => {
    const msg = encodeURIComponent(
      `Hola ${pago.paciente_nombre}, le informamos que su pago de ${formatMoney(pago.monto, pago.moneda)} ` +
      `en Ventura Dental ha sido registrado. ¡Gracias por su confianza!`
    );
    const tel = pago.paciente_telefono?.replace(/\D/g, '') ?? '';
    return `https://wa.me/51${tel}?text=${msg}`;
  };

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Cobros Pendientes</h1>
            <p className="page-subtitle">Pagos registrados por el doctor que esperan ser cobrados</p>
          </div>
          {pendientes.length > 0 && (
            <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.875rem' }}>
              {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {doneId && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> Pago #{doneId} finalizado y comprobante generado correctamente.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* ── Lista de pendientes ── */}
        <div>
          {isLoading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : pendientes.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={56} style={{ margin: '0 auto 1rem', color: 'var(--accent)', opacity: 0.5 }} />
              <h3>No hay cobros pendientes</h3>
              <p>Cuando el doctor registre un pago aparecerá aquí.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendientes.map(pago => (
                <div
                  key={pago.id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    border: selected?.id === pago.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    transform: selected?.id === pago.id ? 'translateX(4px)' : 'none',
                    transition: 'all 0.2s ease',
                    margin: 0,
                  }}
                  onClick={() => { setSelected(pago); setDoneId(null); }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <User size={16} style={{ color: 'var(--primary-light)' }} />
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{pago.paciente_nombre}</span>
                        {pago.paciente_dni && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>DNI: {pago.paciente_dni}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Stethoscope size={14} />
                        <span>Dr/a: {pago.doctor_nombre}</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <Clock size={14} />
                        <span>{formatDate(pago.created_at)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {pago.detalles?.map((d, i) => (
                          <span key={i} style={{
                            fontSize: '0.75rem', padding: '2px 10px', borderRadius: '999px',
                            background: d.es_cuota_principal ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
                            color: d.es_cuota_principal ? '#93c5fd' : 'var(--text-secondary)',
                            border: `1px solid ${d.es_cuota_principal ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
                          }}>
                            {d.es_cuota_principal ? '🦷 ' : '➕ '}{d.descripcion} — {formatMoney(d.monto, pago.moneda)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                        {formatMoney(pago.monto, pago.moneda)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Por cobrar</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Panel de cobro ── */}
        {selected && (
          <div className="card" style={{ position: 'sticky', top: '1.5rem', margin: 0 }}>
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="card-title">Cobrar Pago</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>

            {/* Resumen */}
            <div style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{selected.paciente_nombre}</div>
              {selected.tratamiento_monto_total != null && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    <span>Total tratamiento:</span><span style={{ fontWeight: 600 }}>{formatMoney(selected.tratamiento_monto_total, selected.moneda)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    <span>Total abonado:</span><span style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatMoney(selected.tratamiento_monto_pagado ?? 0, selected.moneda)}</span>
                  </div>
                </>
              )}
              {selected.detalles?.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderTop: i === 0 ? '1px solid var(--border)' : 'none', marginTop: i === 0 ? '4px' : 0 }}>
                  <span style={{ color: d.es_cuota_principal ? '#93c5fd' : 'var(--text-secondary)' }}>{d.descripcion}</span>
                  <span style={{ fontWeight: 600 }}>{formatMoney(d.monto, selected.moneda)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', marginTop: '6px', paddingTop: '6px', fontWeight: 800, fontSize: '1rem', color: 'white' }}>
                <span>TOTAL</span><span style={{ color: 'var(--accent)' }}>{formatMoney(selected.monto, selected.moneda)}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="form-group">
              <label className="form-label"><DollarSign size={14} style={{ marginRight: 4 }} />Método de Pago</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {METODOS_PAGO.map(m => (
                  <button key={m.value} type="button" onClick={() => setMetodo(m.value)}
                    style={{
                      padding: '0.6rem 0.4rem', borderRadius: 'var(--radius)', border: `2px solid ${metodo === m.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: metodo === m.value ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.3)',
                      color: metodo === m.value ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center',
                    }}>
                    <div style={{ fontSize: '1.1rem' }}>{m.emoji}</div>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Firma */}
            <div className="form-group">
              <label className="form-label">Firma del Paciente</label>
              <SignaturePad onSave={setFirma} />
            </div>

            {/* Enviar email */}
            {selected.paciente_email && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={enviarEmail} onChange={e => setEnviarEmail(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                Enviar comprobante por email a {selected.paciente_email}
              </label>
            )}

            {/* WhatsApp */}
            {selected.paciente_telefono && (
              <a href={waLink(selected)} target="_blank" rel="noreferrer"
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem', borderColor: '#25d366', color: '#25d366' }}>
                <MessageCircle size={16} /> Notificar por WhatsApp
              </a>
            )}

            <button
              className="btn btn-success btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleFinalizar}
              disabled={finalizing}
            >
              {finalizing ? 'Procesando...' : <><Send size={18} /> Finalizar Cobro y Emitir Comprobante</>}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
