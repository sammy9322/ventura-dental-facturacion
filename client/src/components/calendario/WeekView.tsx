import React, { useCallback } from 'react';
import type { Cita } from '../../services/citaService';
import AppointmentCard from './AppointmentCard';

interface Props {
  currentDate: Date;
  citas: Cita[];
  horaInicio: number; // e.g. 8
  horaFin: number;    // e.g. 18
  onSlotClick: (date: Date, hour: number) => void;
  onCitaClick: (cita: Cita) => void;
  onCitaDrop: (citaId: number, newStart: string, newEnd: string) => void;
}

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const WeekView: React.FC<Props> = ({
  currentDate, citas, horaInicio, horaFin, onSlotClick, onCitaClick, onCitaDrop,
}) => {
  // Calcular lunes de la semana
  const monday = new Date(currentDate);
  const dayOfWeek = monday.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: (horaFin - horaInicio) * 2 }, (_, i) => {
    const h = horaInicio + Math.floor(i / 2);
    const m = (i % 2) * 30;
    return { hour: h, minute: m, label: i % 2 === 0 ? `${String(h).padStart(2,'0')}:00` : '' };
  });

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const getCitasForDayAndSlot = (date: Date, hour: number, minute: number) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    return citas.filter(c => {
      const cStart = new Date(c.fecha_inicio);
      return c.fecha_inicio.startsWith(dateStr) && cStart.getHours() === hour && cStart.getMinutes() === minute;
    });
  };

  const getCitaDuration = (cita: Cita) => {
    const start = new Date(cita.fecha_inicio).getTime();
    const end = new Date(cita.fecha_fin).getTime();
    return (end - start) / (1000 * 60 * 30); // en slots de 30min
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.add('drag-over');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, date: Date, hour: number, minute: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
    const citaId = Number(e.dataTransfer.getData('citaId'));
    const duration = Number(e.dataTransfer.getData('duration')) || 30;
    if (!citaId) return;

    const newStart = new Date(date);
    newStart.setHours(hour, minute, 0, 0);
    const newEnd = new Date(newStart.getTime() + duration * 60000);

    onCitaDrop(citaId, newStart.toISOString(), newEnd.toISOString());
  }, [onCitaDrop]);

  const handleDragStart = (e: React.DragEvent, cita: Cita) => {
    e.dataTransfer.setData('citaId', String(cita.id));
    const start = new Date(cita.fecha_inicio).getTime();
    const end = new Date(cita.fecha_fin).getTime();
    e.dataTransfer.setData('duration', String((end - start) / 60000));
  };

  return (
    <div className="calendar-week-view">
      <div className="week-header-row">
        <div className="week-time-gutter" />
        {weekDays.map((d, i) => {
          const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          return (
            <div key={i} className={`week-header-cell ${dateStr === todayStr ? 'today' : ''}`}>
              <span className="week-header-day">{DAYS_ES[i]}</span>
              <span className={`week-header-num ${dateStr === todayStr ? 'today-number' : ''}`}>{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      <div className="week-body">
        {hours.map((slot, si) => (
          <div key={si} className={`week-row ${slot.minute === 0 ? 'hour-start' : ''}`}>
            <div className="week-time-gutter">
              {slot.label && <span className="week-time-label">{slot.label}</span>}
            </div>
            {weekDays.map((day, di) => {
              const slotCitas = getCitasForDayAndSlot(day, slot.hour, slot.minute);
              return (
                <div
                  key={di}
                  className="week-cell"
                  onClick={() => onSlotClick(day, slot.hour)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, day, slot.hour, slot.minute)}
                >
                  {slotCitas.map(c => (
                    <div
                      key={c.id}
                      className="week-appointment-wrapper"
                      style={{ height: `${getCitaDuration(c) * 100}%`, minHeight: '100%' }}
                    >
                      <AppointmentCard cita={c} onClick={onCitaClick} onDragStart={handleDragStart} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
