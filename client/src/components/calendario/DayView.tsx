import React, { useCallback } from 'react';
import type { Cita } from '../../services/citaService';
import AppointmentCard from './AppointmentCard';

interface Props {
  currentDate: Date;
  citas: Cita[];
  horaInicio: number;
  horaFin: number;
  onSlotClick: (hour: number, minute: number) => void;
  onCitaClick: (cita: Cita) => void;
  onCitaDrop: (citaId: number, newStart: string, newEnd: string) => void;
}

export const DayView: React.FC<Props> = ({
  currentDate, citas, horaInicio, horaFin, onSlotClick, onCitaClick, onCitaDrop,
}) => {
  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`;
  const dayCitas = citas.filter(c => c.fecha_inicio.startsWith(dateStr));

  const hours = Array.from({ length: (horaFin - horaInicio) * 2 }, (_, i) => {
    const h = horaInicio + Math.floor(i / 2);
    const m = (i % 2) * 30;
    return { hour: h, minute: m, label: i % 2 === 0 ? `${String(h).padStart(2,'0')}:00` : '' };
  });

  const getCitasForSlot = (hour: number, minute: number) => {
    return dayCitas.filter(c => {
      const s = new Date(c.fecha_inicio);
      return s.getHours() === hour && s.getMinutes() === minute;
    });
  };

  const getCitaDuration = (cita: Cita) => {
    const start = new Date(cita.fecha_inicio).getTime();
    const end = new Date(cita.fecha_fin).getTime();
    return (end - start) / (1000 * 60 * 30);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.add('drag-over');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, hour: number, minute: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
    const citaId = Number(e.dataTransfer.getData('citaId'));
    const duration = Number(e.dataTransfer.getData('duration')) || 30;
    if (!citaId) return;

    const newStart = new Date(currentDate);
    newStart.setHours(hour, minute, 0, 0);
    const newEnd = new Date(newStart.getTime() + duration * 60000);

    onCitaDrop(citaId, newStart.toISOString(), newEnd.toISOString());
  }, [currentDate, onCitaDrop]);

  const handleDragStart = (e: React.DragEvent, cita: Cita) => {
    e.dataTransfer.setData('citaId', String(cita.id));
    const start = new Date(cita.fecha_inicio).getTime();
    const end = new Date(cita.fecha_fin).getTime();
    e.dataTransfer.setData('duration', String((end - start) / 60000));
  };

  // Now indicator
  const now = new Date();
  const isToday = dateStr === `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = horaInicio * 60;
  const endMinutes = horaFin * 60;
  const showNowLine = isToday && nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  const nowPosition = ((nowMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;

  return (
    <div className="calendar-day-view">
      {showNowLine && (
        <div className="day-now-line" style={{ top: `${nowPosition}%` }}>
          <div className="day-now-dot" />
        </div>
      )}
      {hours.map((slot, i) => {
        const slotCitas = getCitasForSlot(slot.hour, slot.minute);
        return (
          <div key={i} className={`day-row ${slot.minute === 0 ? 'hour-start' : ''}`}>
            <div className="day-time-gutter">
              {slot.label && <span className="day-time-label">{slot.label}</span>}
            </div>
            <div
              className="day-cell"
              onClick={() => onSlotClick(slot.hour, slot.minute)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, slot.hour, slot.minute)}
            >
              {slotCitas.map(c => (
                <div
                  key={c.id}
                  className="day-appointment-wrapper"
                  style={{ height: `${getCitaDuration(c) * 40}px`, minHeight: '40px' }}
                >
                  <AppointmentCard cita={c} onClick={onCitaClick} onDragStart={handleDragStart} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DayView;
