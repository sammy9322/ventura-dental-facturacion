### Task 8: AppointmentModal + HorarioConfigModal

**Files:**
- Create: `client/src/components/calendario/AppointmentModal.tsx`
- Create: `client/src/components/calendario/HorarioConfigModal.tsx`

**Interfaces:**
- Consumes: `<Modal>` de `components/Modal.tsx`, `citaService`, `PacienteSearch`, tipos `Cita`, `CitaInput`, `HorarioClinica`
- Produces: componentes `<AppointmentModal>`, `<HorarioConfigModal>`

- [ ] **Step 1: Crear `client/src/components/calendario/AppointmentModal.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import PacienteSearch from '../PacienteSearch';
import api from '../../services/api';
import type { Cita, CitaInput } from '../../services/citaService';

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
            onSelect={(p: any) => { setPacienteId(p.id); setPacienteNombre(p.nombre); }}
            value={pacienteNombre}
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
```

- [ ] **Step 2: Crear `client/src/components/calendario/HorarioConfigModal.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import type { HorarioClinica } from '../../services/citaService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (horarios: HorarioClinica[]) => void;
  horarios: HorarioClinica[];
}

const DIAS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const HorarioConfigModal: React.FC<Props> = ({ isOpen, onClose, onSave, horarios }) => {
  const [form, setForm] = useState<HorarioClinica[]>([]);

  useEffect(() => {
    if (horarios.length > 0) {
      setForm([...horarios]);
    } else {
      // Default
      setForm(Array.from({ length: 7 }, (_, i) => ({
        id: 0,
        dia_semana: i,
        hora_apertura: '08:00',
        hora_cierre: '18:00',
        es_laborable: i >= 1 && i <= 5,
      })));
    }
  }, [horarios, isOpen]);

  const updateDay = (diaSemana: number, field: string, value: any) => {
    setForm(prev => prev.map(h =>
      h.dia_semana === diaSemana ? { ...h, [field]: value } : h
    ));
  };

  // Ordenar: Lunes(1) a Domingo(0)
  const sorted = [...form].sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.dia_semana) - order.indexOf(b.dia_semana);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Horarios de la Clínica"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Guardar</button>
        </>
      }
    >
      <div className="horario-config-grid">
        {sorted.map(h => (
          <div key={h.dia_semana} className={`horario-config-row ${!h.es_laborable ? 'disabled' : ''}`}>
            <label className="horario-day-label">
              <input
                type="checkbox"
                checked={h.es_laborable}
                onChange={e => updateDay(h.dia_semana, 'es_laborable', e.target.checked)}
              />
              {DIAS_ES[h.dia_semana]}
            </label>
            <input
              type="time"
              className="form-input form-input-sm"
              value={h.hora_apertura}
              onChange={e => updateDay(h.dia_semana, 'hora_apertura', e.target.value)}
              disabled={!h.es_laborable}
            />
            <span className="horario-separator">a</span>
            <input
              type="time"
              className="form-input form-input-sm"
              value={h.hora_cierre}
              onChange={e => updateDay(h.dia_semana, 'hora_cierre', e.target.value)}
              disabled={!h.es_laborable}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default HorarioConfigModal;
```

- [ ] **Step 3: Verificar que compila**

Run: `cd client && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 4: Commit**

```bash
git add client/src/components/calendario/
git commit -m "feat(ui): add AppointmentModal and HorarioConfigModal"
```
