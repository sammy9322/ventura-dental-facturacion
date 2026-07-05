# Diseño: Módulo de Calendario Clínico — Ventura Dental

**Fecha:** 2026-06-27
**Estado:** Pendiente de aprobación
**Enfoque:** Calendario custom (CSS puro + React, sin dependencias externas)

---

## 1. Propósito

Módulo de calendario clínico que permite a la clínica:
- **Agendar citas** de pacientes con doctores, vinculadas opcionalmente a tratamientos activos
- **Notas personales** para que cada doctor anote recordatorios en su jornada
- **Gestión visual** profesional de la agenda diaria/semanal/mensual

## 2. Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Admin** | Ver/crear/editar/eliminar citas de **todos** los doctores. Configurar horarios de la clínica. |
| **Secretaria** | Ver/crear/editar/eliminar citas de **todos** los doctores. No puede configurar horarios. |
| **Doctor** | Ver/crear/editar/eliminar **solo sus propias** citas y notas personales. |

## 3. Vistas del Calendario

### 3.1 Vista Mensual
- Cuadrícula de días estilo Google Calendar
- Cada día muestra un máximo de 3 citas resumidas (nombre paciente + hora)
- Indicador "+N más" si hay más de 3 citas
- Click en un día → abre la vista diaria de ese día

### 3.2 Vista Semanal
- 7 columnas (lunes a domingo, o según días configurados)
- Filas de franjas horarias según horario configurado (ej: 8:00-18:00)
- Cada cita se renderiza como un bloque cuya altura es proporcional a su duración
- Drag & drop habilitado para mover citas entre slots

### 3.3 Vista Diaria
- Timeline vertical con franjas de 30 minutos
- Vista detallada de cada cita (paciente, procedimiento, doctor, estado, notas)
- Ideal para que el doctor vea "qué viene después"

### 3.4 Toggle de Vistas
- Barra superior con 3 botones: `Mes | Semana | Día`
- Botones de navegación: `← Hoy →`
- Selector de doctor (visible para Admin y Secretaria; filtrar por doctor específico o "Todos")

## 4. Modelo de Datos

### 4.1 Tabla `citas`
```sql
CREATE TABLE IF NOT EXISTS citas (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id),
  doctor_id INTEGER NOT NULL REFERENCES usuarios(id),
  tratamiento_id INTEGER REFERENCES tratamientos(id),
  macro_tratamiento_id INTEGER REFERENCES tratamientos_macro(id),
  titulo VARCHAR(200) NOT NULL,
  notas TEXT,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  estado VARCHAR(20) DEFAULT 'programada'
    CHECK (estado IN ('programada','confirmada','en_progreso','completada','cancelada','no_asistio')),
  es_nota_personal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_citas_doctor_fecha ON citas(doctor_id, fecha_inicio);
CREATE INDEX idx_citas_paciente ON citas(paciente_id);
```

### 4.2 Tabla `configuracion_horario`
```sql
CREATE TABLE IF NOT EXISTS configuracion_horario (
  id SERIAL PRIMARY KEY,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_apertura TIME NOT NULL DEFAULT '08:00',
  hora_cierre TIME NOT NULL DEFAULT '18:00',
  es_laborable BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dia_semana)
);

-- Seed por defecto
INSERT INTO configuracion_horario (dia_semana, hora_apertura, hora_cierre, es_laborable)
VALUES
  (1, '08:00', '18:00', true),
  (2, '08:00', '18:00', true),
  (3, '08:00', '18:00', true),
  (4, '08:00', '18:00', true),
  (5, '08:00', '18:00', true),
  (6, '08:00', '12:00', true),
  (0, '08:00', '12:00', false)
ON CONFLICT DO NOTHING;
```

## 5. API Endpoints (Backend)

### 5.1 Citas
| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/citas?doctor_id=&desde=&hasta=` | Listar citas por rango de fechas | Todos autenticados |
| `GET` | `/api/citas/:id` | Detalle de una cita | Todos autenticados |
| `POST` | `/api/citas` | Crear cita | Admin, Secretaria, Doctor (solo propia) |
| `PUT` | `/api/citas/:id` | Editar cita (incluye drag & drop) | Admin, Secretaria, Doctor (solo propia) |
| `PATCH` | `/api/citas/:id/estado` | Cambiar estado de la cita | Admin, Secretaria, Doctor (solo propia) |
| `DELETE` | `/api/citas/:id` | Eliminar cita | Admin, Secretaria, Doctor (solo propia) |

### 5.2 Configuración de Horario
| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/horario-clinica` | Obtener horarios configurados | Todos autenticados |
| `PUT` | `/api/horario-clinica` | Actualizar horarios | Solo Admin |

## 6. Componentes Frontend

### 6.1 Estructura de Archivos
```
client/src/pages/CalendarioPage.tsx
client/src/components/calendario/
  ├── CalendarToolbar.tsx
  ├── MonthView.tsx
  ├── WeekView.tsx
  ├── DayView.tsx
  ├── AppointmentCard.tsx
  ├── AppointmentModal.tsx
  ├── DoctorFilter.tsx
  └── HorarioConfigModal.tsx
```

### 6.2 AppointmentModal (Crear/Editar Cita)
Campos del formulario:
- **Tipo**: Toggle `Cita | Nota Personal`
- **Paciente** (si es Cita): Buscador autocompletado — obligatorio
- **Tratamiento** (si es Cita): Selector de tratamientos activos del paciente — opcional
- **Doctor**: Autoseleccionado o selector (admin/secretaria)
- **Fecha**: Date picker
- **Hora inicio**: Time picker
- **Duración**: Selector rápido `30min | 45min | 1h | 1.5h | 2h | Personalizado`
- **Título/Motivo**: Texto libre
- **Notas**: Textarea libre
- **Estado**: Selector del estado

### 6.3 AppointmentCard
- Bloque coloreado según el macro tratamiento:
  - Ortodoncia → `#4A90D9` (azul)
  - Endodoncia → `#E74C3C` (rojo suave)
  - Limpieza → `#2ECC71` (verde)
  - Corona → `#F39C12` (ámbar)
  - Extracción → `#9B59B6` (púrpura)
  - Otros → `var(--brand-turquoise)`
  - Nota personal → `#95A5A6` (gris)
- Muestra: hora, nombre paciente, indicador de estado (dot)
- Soporte drag & drop (HTML5 API nativa)

## 7. Colores de Estado

| Estado | Color | Indicador |
|--------|-------|-----------|
| `programada` | `#3498DB` | 🔵 |
| `confirmada` | `#2ECC71` | 🟢 |
| `en_progreso` | `#F39C12` | 🟡 |
| `completada` | `#27AE60` | ✅ |
| `cancelada` | `#E74C3C` | 🔴 |
| `no_asistio` | `#95A5A6` | ⚪ |

## 8. Drag & Drop

Implementación con HTML5 Drag API nativa:
- `draggable="true"` en `AppointmentCard`
- `onDragStart`: Almacenar `citaId` en `dataTransfer`
- `onDragOver`: Resaltar slot destino con borde visual
- `onDrop`: Llamar `PUT /api/citas/:id` con nueva `fecha_inicio` / `fecha_fin`
- Solo en vistas Semanal y Diaria

## 9. Validaciones

- **Conflicto de horario**: Backend verifica traslape → error 409
- **Fuera de horario**: Advertencia visual (no bloqueo)
- **Permisos**: Doctor solo modifica citas donde `doctor_id` = su `id`

## 10. Badge de Citas Próximas (Sidebar)

- Badge numérico en item "Calendario" del sidebar
- Admin/Secretaria: total citas de hoy (todos los doctores)
- Doctor: solo sus citas de hoy

## 11. CSS / Estética

- Marca Ventura: `--brand-purple`, `--brand-turquoise`, `--brand-white`
- Consistente con cards y modales glassmorphism existentes
- Transiciones suaves al cambiar vistas
- Hover en slots vacíos para invitar a crear cita
- Responsive: mobile → vista diaria por defecto

## 12. Fuera de Alcance (V1)

- Notificaciones push/email de recordatorio
- Integración con Google Calendar
- Citas recurrentes
- Reportes de asistencia/productividad
