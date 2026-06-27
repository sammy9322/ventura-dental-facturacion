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
