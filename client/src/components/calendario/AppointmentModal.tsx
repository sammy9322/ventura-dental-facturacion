import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import PacienteSearch from '../PacienteSearch';
import api from '../../services/api';
import type { Cita, CitaInput } from '../../services/citaService';
import type { Paciente } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CitaInput) => void;
  cita?: Cita | null;
  defaultDate?: Date;
  defaultHour?: number;
  doctors: { id: number; nombre_completo: string }[];
  currentUserId: number;
  currentUserRol: string;
  macroTratamientos: { id: number; nombre: string }[];
}

const DURACIONES = [
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hora', value: 60 },
  { label: '1.5 horas', value: 90 },
  { label: '2 horas', value: 120 },
];

const ESTADOS = [
  { value: 'programada', label: 'Programada' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no_asistio', label: 'No asistió' },
];

export const AppointmentModal: React.FC<Props> = ({
  isOpen, onClose, onSave, cita, defaultDate, defaultHour,
  doctors, currentUserId, currentUserRol, macroTratamientos,
}) => {
  const [esNota, setEsNota] = useState(false);
  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [pacienteNombre, setPacienteNombre] = useState('');
  const [doctorId, setDoctorId] = useState(currentUserId);
  const [tratamientoId, setTratamientoId] = useState<number | null>(null);
  const [macroId, setMacroId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [notas, setNotas] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [duracion, setDuracion] = useState(30);
  const [estado, setEstado] = useState('programada');
  const [tratamientosActivos, setTratamientosActivos] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cita) {
      setEsNota(cita.es_nota_personal);
      setPacienteId(cita.paciente_id);
      setPacienteNombre(cita.paciente_nombre || '');
      setDoctorId(cita.doctor_id);
      setTratamientoId(cita.tratamiento_id);
      setMacroId(cita.macro_tratamiento_id);
      setTitulo(cita.titulo);
      setNotas(cita.notas || '');
      const start = new Date(cita.fecha_inicio);
      setFecha(start.toISOString().split('T')[0]);
      setHoraInicio(`${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`);
      const diff = (new Date(cita.fecha_fin).getTime() - start.getTime()) / 60000;
      setDuracion(diff);
      setEstado(cita.estado);
    } else {
      setEsNota(false);
      setPacienteId(null);
      setPacienteNombre('');
      setDoctorId(currentUserId);
      setTratamientoId(null);
      setMacroId(null);
      setTitulo('');
      setNotas('');
      setDuracion(30);
      setEstado('programada');
      if (defaultDate) {
        setFecha(defaultDate.toISOString().split('T')[0]);
      }
      if (defaultHour !== undefined) {
        setHoraInicio(`${String(defaultHour).padStart(2,'0')}:00`);
      }
    }
    setError('');
  }, [cita, isOpen, defaultDate, defaultHour, currentUserId]);

  // Cargar tratamientos del paciente
  useEffect(() => {
    if (pacienteId) {
      api.get(`/tratamientos?paciente_id=${pacienteId}&estado=activo`)
        .then(res => setTratamientosActivos(res.data?.tratamientos || res.data || []))
        .catch(() => setTratamientosActivos([]));
    } else {
      setTratamientosActivos([]);
    }
  }, [pacienteId]);

  const handleSubmit = () => {
    setError('');
    if (!titulo.trim()) { setError('El título es requerido'); return; }
    if (!fecha) { setError('La fecha es requerida'); return; }
    if (!esNota && !pacienteId) { setError('Seleccione un paciente'); return; }

    const [h, m] = horaInicio.split(':').map(Number);
    const start = new Date(`${fecha}T${horaInicio}:00`);
    const end = new Date(start.getTime() + duracion * 60000);

    onSave({
      paciente_id: esNota ? null : pacienteId,
      doctor_id: doctorId,
      tratamiento_id: esNota ? null : tratamientoId,
      macro_tratamiento_id: esNota ? null : macroId,
      titulo,
      notas: notas || undefined,
      fecha_inicio: start.toISOString(),
      fecha_fin: end.toISOString(),
      estado,
      es_nota_personal: esNota,
    });
  };

  const canSelectDoctor = currentUserRol === 'admin' || currentUserRol === 'secretaria';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cita ? 'Editar Cita' : 'Nueva Cita'}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {cita ? 'Guardar Cambios' : 'Crear Cita'}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}

      {/* Toggle Cita / Nota */}
      <div className="form-group">
        <div className="calendar-type-toggle">
          <button
            className={`calendar-type-btn ${!esNota ? 'active' : ''}`}
            onClick={() => setEsNota(false)}
          >
            🗓️ Cita
          </button>
          <button
            className={`calendar-type-btn ${esNota ? 'active' : ''}`}
            onClick={() => setEsNota(true)}
          >
            📝 Nota Personal
          </button>
        </div>
      </div>

      {/* Paciente (solo para citas) */}
      {!esNota && (
        <div className="form-group">
          <label className="form-label">Paciente *</label>
          <PacienteSearch
            onSelect={(p: Paciente) => { setPacienteId(p.id); setPacienteNombre(p.nombre); }}
            selectedPaciente={pacienteId ? { id: pacienteId, nombre: pacienteNombre } as Paciente : null}
          />
        </div>
      )}

      {/* Doctor */}
      {canSelectDoctor && (
        <div className="form-group">
          <label className="form-label">Doctor</label>
          <select className="form-input" value={doctorId} onChange={e => setDoctorId(Number(e.target.value))}>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.nombre_completo}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tratamiento (opcional, solo para citas) */}
      {!esNota && pacienteId && tratamientosActivos.length > 0 && (
        <div className="form-group">
          <label className="form-label">Tratamiento (opcional)</label>
          <select
            className="form-input"
            value={tratamientoId || ''}
            onChange={e => {
              const tid = e.target.value ? Number(e.target.value) : null;
              setTratamientoId(tid);
              const t = tratamientosActivos.find((tr: any) => tr.id === tid);
              if (t?.macro_tratamiento_id) setMacroId(t.macro_tratamiento_id);
            }}
          >
            <option value="">Sin tratamiento específico</option>
            {tratamientosActivos.map((t: any) => (
              <option key={t.id} value={t.id}>{t.tipo} - {t.descripcion || 'Sin descripción'}</option>
            ))}
          </select>
        </div>
      )}

      {/* Macro (para color) — solo si no hay tratamiento vinculado */}
      {!esNota && !tratamientoId && (
        <div className="form-group">
          <label className="form-label">Tipo de procedimiento (para color)</label>
          <select className="form-input" value={macroId || ''} onChange={e => setMacroId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">General</option>
            {macroTratamientos.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* Título */}
      <div className="form-group">
        <label className="form-label">{esNota ? 'Nota' : 'Motivo de la cita'} *</label>
        <input className="form-input" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder={esNota ? 'Recordatorio...' : 'Ej: Control mensual ortodoncia'} />
      </div>

      {/* Fecha + Hora + Duración */}
      <div className="form-row-3">
        <div className="form-group">
          <label className="form-label">Fecha *</label>
          <input type="date" className="form-input" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Hora inicio</label>
          <input type="time" className="form-input" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Duración</label>
          <select className="form-input" value={duracion} onChange={e => setDuracion(Number(e.target.value))}>
            {DURACIONES.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notas */}
      <div className="form-group">
        <label className="form-label">Notas adicionales</label>
        <textarea className="form-input" rows={3} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observaciones..." />
      </div>

      {/* Estado (solo en edición) */}
      {cita && (
        <div className="form-group">
          <label className="form-label">Estado</label>
          <select className="form-input" value={estado} onChange={e => setEstado(e.target.value)}>
            {ESTADOS.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
      )}
    </Modal>
  );
};

export default AppointmentModal;
