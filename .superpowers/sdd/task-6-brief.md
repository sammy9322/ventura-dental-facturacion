### Task 6: Componentes del Calendario — CalendarToolbar + AppointmentCard

**Files:**
- Create: `client/src/components/calendario/CalendarToolbar.tsx`
- Create: `client/src/components/calendario/AppointmentCard.tsx`

**Interfaces:**
- Consumes: tipos `Cita` de `citaService.ts`
- Produces: componentes `<CalendarToolbar>` y `<AppointmentCard>`

Make sure the `calendario` directory exists before creating files.

- [ ] **Step 1: Crear `client/src/components/calendario/CalendarToolbar.tsx`**

```tsx
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Settings } from 'lucide-react';

export type CalendarView = 'month' | 'week' | 'day';

interface Props {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onDateChange: (date: Date) => void;
  doctors?: { id: number; nombre_completo: string }[];
  selectedDoctorId?: number | null;
  onDoctorChange?: (id: number | null) => void;
  showDoctorFilter: boolean;
  showConfigButton: boolean;
  onConfigClick?: () => void;
}

const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const VIEW_LABELS: Record<CalendarView, string> = {
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
};

export const CalendarToolbar: React.FC<Props> = ({
  currentDate, view, onViewChange, onNavigate, onDateChange,
  doctors, selectedDoctorId, onDoctorChange,
  showDoctorFilter, showConfigButton, onConfigClick,
}) => {
  const getTitle = () => {
    if (view === 'month') {
      return `${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (view === 'day') {
      return `${currentDate.getDate()} de ${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    // week
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} de ${MONTHS_ES[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${MONTHS_ES[start.getMonth()].substring(0,3)} - ${end.getDate()} ${MONTHS_ES[end.getMonth()].substring(0,3)} ${end.getFullYear()}`;
  };

  return (
    <div className="calendar-toolbar">
      <div className="calendar-toolbar-left">
        <button className="btn btn-outline btn-sm" onClick={() => onNavigate('today')}>Hoy</button>
        <button className="btn-icon" onClick={() => onNavigate('prev')}><ChevronLeft size={20} /></button>
        <button className="btn-icon" onClick={() => onNavigate('next')}><ChevronRight size={20} /></button>
        <h2 className="calendar-toolbar-title">{getTitle()}</h2>
      </div>

      <div className="calendar-toolbar-right">
        {showDoctorFilter && doctors && onDoctorChange && (
          <select
            className="form-input calendar-doctor-select"
            value={selectedDoctorId ?? ''}
            onChange={e => onDoctorChange(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Todos los doctores</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.nombre_completo}</option>
            ))}
          </select>
        )}

        <div className="calendar-view-toggle">
          {(['month','week','day'] as CalendarView[]).map(v => (
            <button
              key={v}
              className={`calendar-view-btn ${view === v ? 'active' : ''}`}
              onClick={() => onViewChange(v)}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>

        {showConfigButton && onConfigClick && (
          <button className="btn-icon" onClick={onConfigClick} title="Configurar horarios">
            <Settings size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CalendarToolbar;
```

- [ ] **Step 2: Crear `client/src/components/calendario/AppointmentCard.tsx`**

```tsx
import React from 'react';
import type { Cita } from '../../services/citaService';

const MACRO_COLORS: Record<string, string> = {
  'Ortodoncia': '#4A90D9',
  'Endodoncia': '#E74C3C',
  'Limpieza': '#2ECC71',
  'Corona': '#F39C12',
  'Extracción': '#9B59B6',
  'Blanqueamiento': '#1ABC9C',
  'Implante': '#E67E22',
  'Ortopedia': '#3498DB',
  'Resina': '#27AE60',
  'Radiografía': '#8E44AD',
  'Consulta': '#2980B9',
};

const ESTADO_COLORS: Record<string, string> = {
  programada: '#3498DB',
  confirmada: '#2ECC71',
  en_progreso: '#F39C12',
  completada: '#27AE60',
  cancelada: '#E74C3C',
  no_asistio: '#95A5A6',
};

interface Props {
  cita: Cita;
  compact?: boolean;
  onClick?: (cita: Cita) => void;
  onDragStart?: (e: React.DragEvent, cita: Cita) => void;
}

export const AppointmentCard: React.FC<Props> = ({ cita, compact, onClick, onDragStart }) => {
  const bgColor = cita.es_nota_personal
    ? '#95A5A6'
    : MACRO_COLORS[cita.macro_nombre || ''] || 'var(--brand-turquoise)';

  const estadoColor = ESTADO_COLORS[cita.estado] || '#95A5A6';

  const hora = new Date(cita.fecha_inicio).toLocaleTimeString('es-CR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  return (
    <div
      className={`appointment-card ${compact ? 'compact' : ''} ${cita.estado === 'cancelada' || cita.estado === 'no_asistio' ? 'dimmed' : ''}`}
      style={{ borderLeftColor: bgColor, '--appointment-bg': `${bgColor}18` } as React.CSSProperties}
      onClick={() => onClick?.(cita)}
      draggable={!!onDragStart}
      onDragStart={e => onDragStart?.(e, cita)}
    >
      <div className="appointment-card-header">
        <span className="appointment-time">{hora}</span>
        <span className="appointment-status-dot" style={{ backgroundColor: estadoColor }} />
      </div>
      <div className="appointment-card-body">
        <span className="appointment-title">
          {cita.es_nota_personal ? '📝 ' : ''}{cita.titulo}
        </span>
        {!compact && cita.paciente_nombre && (
          <span className="appointment-patient">{cita.paciente_nombre}</span>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
```

- [ ] **Step 3: Verificar que compila**

Run: `cd client && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 4: Commit**

```bash
git add client/src/components/calendario/
git commit -m "feat(ui): add CalendarToolbar and AppointmentCard components"
```
