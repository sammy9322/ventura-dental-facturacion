### Task 9: CalendarioPage — Página Principal

**Files:**
- Create: `client/src/pages/CalendarioPage.tsx`
- Modify: `client/src/pages/index.ts` (exportar página)

**Interfaces:**
- Consumes: `CalendarToolbar`, `MonthView`, `WeekView`, `DayView`, `AppointmentModal`, `HorarioConfigModal`, `citaService`, `authService`
- Produces: página `/calendario` completa

- [ ] **Step 1: Crear `client/src/pages/CalendarioPage.tsx`**

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { citaService } from '../services/citaService';
import { authService } from '../services';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import CalendarToolbar, { CalendarView } from '../components/calendario/CalendarToolbar';
import MonthView from '../components/calendario/MonthView';
import WeekView from '../components/calendario/WeekView';
import DayView from '../components/calendario/DayView';
import AppointmentModal from '../components/calendario/AppointmentModal';
import HorarioConfigModal from '../components/calendario/HorarioConfigModal';
import type { Cita, CitaInput, HorarioClinica } from '../services/citaService';

const CalendarioPage: React.FC = () => {
  const user = authService.getUser();
  const { toast } = useToast();

  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  // Doctors filter
  const [doctors, setDoctors] = useState<{ id: number; nombre_completo: string }[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  // Macro tratamientos (para colores y selector)
  const [macroTratamientos, setMacroTratamientos] = useState<{ id: number; nombre: string }[]>([]);

  // Horario
  const [horarios, setHorarios] = useState<HorarioClinica[]>([]);
  const [showHorarioConfig, setShowHorarioConfig] = useState(false);

  // Modal cita
  const [showCitaModal, setShowCitaModal] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [defaultHour, setDefaultHour] = useState<number | undefined>();

  const isAdmin = user?.rol === 'admin';
  const isDoctor = user?.rol === 'doctor';
  const showDoctorFilter = !isDoctor;

  // Calcular rango de fechas según la vista
  const getDateRange = useCallback(() => {
    const d = new Date(currentDate);
    let desde: string, hasta: string;

    if (view === 'month') {
      const first = new Date(d.getFullYear(), d.getMonth(), 1);
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      // Incluir días de semanas parciales
      first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
      last.setDate(last.getDate() + (7 - last.getDay()) % 7);
      desde = first.toISOString();
      hasta = last.toISOString();
    } else if (view === 'week') {
      const monday = new Date(d);
      const dayOfWeek = monday.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      monday.setDate(monday.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      desde = monday.toISOString();
      hasta = sunday.toISOString();
    } else {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      desde = start.toISOString();
      hasta = end.toISOString();
    }

    return { desde, hasta };
  }, [currentDate, view]);

  const fetchCitas = useCallback(async () => {
    try {
      setLoading(true);
      const { desde, hasta } = getDateRange();
      const params: any = { desde, hasta };
      if (selectedDoctorId) params.doctor_id = selectedDoctorId;
      const data = await citaService.getAll(params);
      setCitas(data);
    } catch (err) {
      toast.error('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, [getDateRange, selectedDoctorId, toast]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [horariosData, macrosRes] = await Promise.all([
          citaService.getHorarioClinica(),
          api.get('/tratamientos-macro'),
        ]);
        setHorarios(horariosData);
        setMacroTratamientos(macrosRes.data || []);

        if (showDoctorFilter) {
          // Cargar lista de doctores
          const usersRes = await api.get('/auth/usuarios');
          const docs = (usersRes.data || []).filter((u: any) => u.rol === 'doctor' && u.activo);
          setDoctors(docs);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };
    loadInitial();
  }, [showDoctorFilter]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  // Navegación
  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }
    const d = new Date(currentDate);
    const delta = direction === 'next' ? 1 : -1;
    if (view === 'month') d.setMonth(d.getMonth() + delta);
    else if (view === 'week') d.setDate(d.getDate() + 7 * delta);
    else d.setDate(d.getDate() + delta);
    setCurrentDate(d);
  };

  // Horario helpers
  const getHoraInicio = () => {
    const laborables = horarios.filter(h => h.es_laborable);
    if (laborables.length === 0) return 8;
    return Math.min(...laborables.map(h => parseInt(h.hora_apertura)));
  };
  const getHoraFin = () => {
    const laborables = horarios.filter(h => h.es_laborable);
    if (laborables.length === 0) return 18;
    return Math.max(...laborables.map(h => parseInt(h.hora_cierre)));
  };

  // Acciones
  const handleCitaClick = (cita: Cita) => {
    setEditingCita(cita);
    setShowCitaModal(true);
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  const handleSlotClick = (dateOrHour: Date | number, hourOrMinute?: number) => {
    if (typeof dateOrHour === 'number') {
      // DayView: (hour, minute)
      setDefaultDate(currentDate);
      setDefaultHour(dateOrHour);
    } else {
      // WeekView: (date, hour)
      setDefaultDate(dateOrHour);
      setDefaultHour(hourOrMinute);
    }
    setEditingCita(null);
    setShowCitaModal(true);
  };

  const handleSaveCita = async (data: CitaInput) => {
    try {
      if (editingCita) {
        await citaService.update(editingCita.id, data);
        toast.success('Cita actualizada');
      } else {
        await citaService.create(data);
        toast.success('Cita creada');
      }
      setShowCitaModal(false);
      setEditingCita(null);
      fetchCitas();
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error(err.response.data.error || 'Conflicto de horario');
      } else {
        toast.error(err.response?.data?.error || 'Error al guardar la cita');
      }
    }
  };

  const handleCitaDrop = async (citaId: number, newStart: string, newEnd: string) => {
    try {
      await citaService.update(citaId, { fecha_inicio: newStart, fecha_fin: newEnd });
      toast.success('Cita movida');
      fetchCitas();
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error('No se puede mover: conflicto de horario');
      } else {
        toast.error('Error al mover la cita');
      }
    }
  };

  const handleSaveHorario = async (data: HorarioClinica[]) => {
    try {
      const updated = await citaService.updateHorarioClinica(data);
      setHorarios(updated);
      setShowHorarioConfig(false);
      toast.success('Horarios actualizados');
    } catch {
      toast.error('Error al guardar horarios');
    }
  };

  return (
    <div className="page-container calendario-page">
      <div className="page-header">
        <h1>📅 Calendario</h1>
        <button className="btn btn-primary" onClick={() => { setEditingCita(null); setDefaultDate(new Date()); setDefaultHour(undefined); setShowCitaModal(true); }}>
          + Nueva Cita
        </button>
      </div>

      <CalendarToolbar
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
        onDateChange={setCurrentDate}
        doctors={doctors}
        selectedDoctorId={selectedDoctorId}
        onDoctorChange={setSelectedDoctorId}
        showDoctorFilter={showDoctorFilter}
        showConfigButton={isAdmin}
        onConfigClick={() => setShowHorarioConfig(true)}
      />

      <div className="calendar-body">
        {loading ? (
          <div className="page-loader"><div className="page-loader-spinner" /></div>
        ) : (
          <>
            {view === 'month' && (
              <MonthView currentDate={currentDate} citas={citas} onDayClick={handleDayClick} onCitaClick={handleCitaClick} />
            )}
            {view === 'week' && (
              <WeekView
                currentDate={currentDate} citas={citas}
                horaInicio={getHoraInicio()} horaFin={getHoraFin()}
                onSlotClick={handleSlotClick} onCitaClick={handleCitaClick} onCitaDrop={handleCitaDrop}
              />
            )}
            {view === 'day' && (
              <DayView
                currentDate={currentDate} citas={citas}
                horaInicio={getHoraInicio()} horaFin={getHoraFin()}
                onSlotClick={handleSlotClick} onCitaClick={handleCitaClick} onCitaDrop={handleCitaDrop}
              />
            )}
          </>
        )}
      </div>

      <AppointmentModal
        isOpen={showCitaModal}
        onClose={() => { setShowCitaModal(false); setEditingCita(null); }}
        onSave={handleSaveCita}
        cita={editingCita}
        defaultDate={defaultDate}
        defaultHour={defaultHour}
        doctors={doctors}
        currentUserId={user?.id || 0}
        currentUserRol={user?.rol || 'doctor'}
        macroTratamientos={macroTratamientos}
      />

      <HorarioConfigModal
        isOpen={showHorarioConfig}
        onClose={() => setShowHorarioConfig(false)}
        onSave={handleSaveHorario}
        horarios={horarios}
      />
    </div>
  );
};

export default CalendarioPage;
```

- [ ] **Step 2: Exportar en `client/src/pages/index.ts`**

Agregar al final del archivo:

```typescript
export { default as CalendarioPage } from './CalendarioPage';
```

- [ ] **Step 3: Verificar que compila**

Run: `cd client && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/CalendarioPage.tsx client/src/pages/index.ts
git commit -m "feat(page): add CalendarioPage with full calendar logic"
```
