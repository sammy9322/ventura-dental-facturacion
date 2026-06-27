import React from 'react';
import type { Cita } from '../../services/citaService';
import AppointmentCard from './AppointmentCard';

interface Props {
  currentDate: Date;
  citas: Cita[];
  onDayClick: (date: Date) => void;
  onCitaClick: (cita: Cita) => void;
}

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const MonthView: React.FC<Props> = ({ currentDate, citas, onDayClick, onCitaClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Ajustar para que la semana empiece en lunes
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const totalDays = lastDay.getDate();
  const totalCells = Math.ceil((totalDays + startOffset) / 7) * 7;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const getCitasForDay = (day: number) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return citas.filter(c => c.fecha_inicio.startsWith(dateStr));
  };

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    const isCurrentMonth = dayNum >= 1 && dayNum <= totalDays;
    const dateStr = isCurrentMonth ? `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}` : '';
    const isToday = dateStr === todayStr;
    const dayCitas = isCurrentMonth ? getCitasForDay(dayNum) : [];

    cells.push(
      <div
        key={i}
        className={`month-cell ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}`}
        onClick={() => isCurrentMonth && onDayClick(new Date(year, month, dayNum))}
      >
        {isCurrentMonth && (
          <>
            <span className={`month-cell-day ${isToday ? 'today-number' : ''}`}>{dayNum}</span>
            <div className="month-cell-citas">
              {dayCitas.slice(0, 3).map(c => (
                <AppointmentCard key={c.id} cita={c} compact onClick={onCitaClick} />
              ))}
              {dayCitas.length > 3 && (
                <span className="month-cell-more">+{dayCitas.length - 3} más</span>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="calendar-month-view">
      <div className="month-header-row">
        {DAYS_ES.map(d => <div key={d} className="month-header-cell">{d}</div>)}
      </div>
      <div className="month-grid">
        {cells}
      </div>
    </div>
  );
};

export default MonthView;
