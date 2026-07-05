### Task 7: Componentes del Calendario — MonthView, WeekView, DayView

**Files:**
- Create: `client/src/components/calendario/MonthView.tsx`
- Create: `client/src/components/calendario/WeekView.tsx`
- Create: `client/src/components/calendario/DayView.tsx`

**Interfaces:**
- Consumes: tipos `Cita` de `citaService.ts`, `<AppointmentCard>`
- Produces: componentes `<MonthView>`, `<WeekView>`, `<DayView>`

- [ ] **Step 1: Crear `client/src/components/calendario/MonthView.tsx`**

```tsx
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
```

- [ ] **Step 2: Crear `client/src/components/calendario/WeekView.tsx`**

```tsx
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
```

- [ ] **Step 3: Crear `client/src/components/calendario/DayView.tsx`**

```tsx
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
```

- [ ] **Step 4: Verificar que compila**

Run: `cd client && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 5: Commit**

```bash
git add client/src/components/calendario/
git commit -m "feat(ui): add MonthView, WeekView, DayView calendar components"
```
