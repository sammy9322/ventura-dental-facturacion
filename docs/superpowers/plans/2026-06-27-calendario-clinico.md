# Calendario Clínico — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un módulo de calendario clínico completo con vistas mensual/semanal/diaria, drag & drop, estados de cita, notas personales, y configuración de horarios.

**Architecture:** Backend REST (Express + PostgreSQL) con modelo `cita` y `configuracion_horario`. Frontend React con componentes modulares en `client/src/components/calendario/`. Página principal `CalendarioPage.tsx`. CSS puro siguiendo la marca Ventura.

**Tech Stack:** React 18 + TypeScript, Node/Express + TypeScript, PostgreSQL (pg nativo), CSS puro, HTML5 Drag API, Zod (validación), lucide-react (iconos).

## Global Constraints

- **CSS:** Vanilla CSS solamente. Sin TailwindCSS. Seguir paleta `--brand-purple: #613192`, `--brand-turquoise: #00BCD4`, `--brand-white: #FFFFFF`.
- **DB:** PostgreSQL con driver `pg` nativo. Sin ORM. Usar `BEGIN/COMMIT` para transacciones.
- **Errores:** Rutas backend envueltas en `asyncHandler`. Frontend con `ErrorBoundary`.
- **Validación:** Usar `zod` para schemas de entrada.
- **Imports:** Usar extensión `.js` en imports del backend (ESM).
- **Auth:** Usar `authenticateToken` + guards de rol del middleware existente.

---

### Task 1: Migración de Base de Datos (tablas citas + configuracion_horario)

**Files:**
- Modify: `server/src/scripts/initDb.ts` (agregar tablas al final, antes del COMMIT)

**Interfaces:**
- Produces: Tablas `citas` y `configuracion_horario` en PostgreSQL

- [ ] **Step 1: Agregar tabla `citas` en `initDb.ts`**

Agregar este bloque **después** de la tabla `cierres_caja` (después de línea 348) y **antes** del `COMMIT` (línea 352):

```typescript
    // ── Tabla citas (Calendario Clínico) ───────────────────────────
    await client.query(`
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
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_citas_doctor_fecha ON citas(doctor_id, fecha_inicio)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id)`);
    console.log('✓ Tabla citas lista');
```

- [ ] **Step 2: Agregar tabla `configuracion_horario` en `initDb.ts`**

Agregar inmediatamente después del bloque anterior:

```typescript
    // ── Tabla configuracion_horario ────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracion_horario (
        id SERIAL PRIMARY KEY,
        dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
        hora_apertura TIME NOT NULL DEFAULT '08:00',
        hora_cierre TIME NOT NULL DEFAULT '18:00',
        es_laborable BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(dia_semana)
      )
    `);
    await client.query(`
      INSERT INTO configuracion_horario (dia_semana, hora_apertura, hora_cierre, es_laborable)
      VALUES
        (1, '08:00', '18:00', true),
        (2, '08:00', '18:00', true),
        (3, '08:00', '18:00', true),
        (4, '08:00', '18:00', true),
        (5, '08:00', '18:00', true),
        (6, '08:00', '12:00', true),
        (0, '08:00', '12:00', false)
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Tabla configuracion_horario lista');
```

- [ ] **Step 3: Verificar que compila**

Run: `cd server && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 4: Commit**

```bash
git add server/src/scripts/initDb.ts
git commit -m "feat(db): add citas and configuracion_horario tables"
```

---

### Task 2: Modelo Backend — cita.ts

**Files:**
- Create: `server/src/models/cita.ts`

**Interfaces:**
- Consumes: tablas `citas`, `pacientes`, `usuarios`, `tratamientos`, `tratamientos_macro` de PostgreSQL
- Produces: funciones `getAll(filters)`, `getById(id)`, `create(data)`, `update(id, data)`, `updateEstado(id, estado)`, `remove(id)`, `countToday(doctorId?)`

- [ ] **Step 1: Crear `server/src/models/cita.ts`**

```typescript
import { pool } from '../config/database.js';

export interface CitaFilters {
  doctor_id?: number;
  desde?: string; // ISO date
  hasta?: string; // ISO date
}

export interface CitaInput {
  paciente_id?: number | null;
  doctor_id: number;
  tratamiento_id?: number | null;
  macro_tratamiento_id?: number | null;
  titulo: string;
  notas?: string;
  fecha_inicio: string; // ISO timestamp
  fecha_fin: string;
  estado?: string;
  es_nota_personal?: boolean;
}

export async function getAll(filters: CitaFilters) {
  let query = `
    SELECT c.*,
           p.nombre AS paciente_nombre,
           u.nombre_completo AS doctor_nombre,
           tm.nombre AS macro_nombre
    FROM citas c
    LEFT JOIN pacientes p ON c.paciente_id = p.id
    LEFT JOIN usuarios u ON c.doctor_id = u.id
    LEFT JOIN tratamientos_macro tm ON c.macro_tratamiento_id = tm.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;

  if (filters.doctor_id) {
    query += ` AND c.doctor_id = $${idx++}`;
    params.push(filters.doctor_id);
  }
  if (filters.desde) {
    query += ` AND c.fecha_inicio >= $${idx++}`;
    params.push(filters.desde);
  }
  if (filters.hasta) {
    query += ` AND c.fecha_fin <= $${idx++}`;
    params.push(filters.hasta);
  }

  query += ` ORDER BY c.fecha_inicio ASC`;
  const { rows } = await pool.query(query, params);
  return rows;
}

export async function getById(id: number) {
  const { rows } = await pool.query(
    `SELECT c.*,
            p.nombre AS paciente_nombre,
            u.nombre_completo AS doctor_nombre,
            tm.nombre AS macro_nombre,
            t.tipo AS tratamiento_tipo,
            t.descripcion AS tratamiento_descripcion
     FROM citas c
     LEFT JOIN pacientes p ON c.paciente_id = p.id
     LEFT JOIN usuarios u ON c.doctor_id = u.id
     LEFT JOIN tratamientos_macro tm ON c.macro_tratamiento_id = tm.id
     LEFT JOIN tratamientos t ON c.tratamiento_id = t.id
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function create(data: CitaInput) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar conflicto de horario para el doctor
    const { rows: conflictos } = await client.query(
      `SELECT id FROM citas
       WHERE doctor_id = $1
         AND estado NOT IN ('cancelada', 'no_asistio')
         AND fecha_inicio < $3
         AND fecha_fin > $2`,
      [data.doctor_id, data.fecha_inicio, data.fecha_fin]
    );
    if (conflictos.length > 0) {
      await client.query('ROLLBACK');
      return { conflict: true };
    }

    const { rows } = await client.query(
      `INSERT INTO citas (paciente_id, doctor_id, tratamiento_id, macro_tratamiento_id,
                          titulo, notas, fecha_inicio, fecha_fin, estado, es_nota_personal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.paciente_id || null,
        data.doctor_id,
        data.tratamiento_id || null,
        data.macro_tratamiento_id || null,
        data.titulo,
        data.notas || null,
        data.fecha_inicio,
        data.fecha_fin,
        data.estado || 'programada',
        data.es_nota_personal || false,
      ]
    );

    await client.query('COMMIT');
    return { conflict: false, cita: rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function update(id: number, data: Partial<CitaInput>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Si cambian las fechas, verificar conflicto
    if (data.fecha_inicio && data.fecha_fin && data.doctor_id) {
      const { rows: conflictos } = await client.query(
        `SELECT id FROM citas
         WHERE doctor_id = $1
           AND id != $4
           AND estado NOT IN ('cancelada', 'no_asistio')
           AND fecha_inicio < $3
           AND fecha_fin > $2`,
        [data.doctor_id, data.fecha_inicio, data.fecha_fin, id]
      );
      if (conflictos.length > 0) {
        await client.query('ROLLBACK');
        return { conflict: true };
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedFields = [
      'paciente_id', 'doctor_id', 'tratamiento_id', 'macro_tratamiento_id',
      'titulo', 'notas', 'fecha_inicio', 'fecha_fin', 'estado', 'es_nota_personal'
    ];

    for (const key of allowedFields) {
      if (key in data) {
        fields.push(`${key} = $${idx++}`);
        values.push((data as any)[key]);
      }
    }

    if (fields.length === 0) {
      await client.query('ROLLBACK');
      return { conflict: false, cita: await getById(id) };
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await client.query(
      `UPDATE citas SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    await client.query('COMMIT');
    return { conflict: false, cita: rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateEstado(id: number, estado: string) {
  const { rows } = await pool.query(
    `UPDATE citas SET estado = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [estado, id]
  );
  return rows[0] || null;
}

export async function remove(id: number) {
  const { rowCount } = await pool.query(`DELETE FROM citas WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}

export async function countToday(doctorId?: number) {
  const today = new Date().toISOString().split('T')[0];
  let query = `SELECT COUNT(*)::int AS total FROM citas WHERE fecha_inicio::date = $1 AND estado NOT IN ('cancelada', 'no_asistio')`;
  const params: any[] = [today];
  if (doctorId) {
    query += ` AND doctor_id = $2`;
    params.push(doctorId);
  }
  const { rows } = await pool.query(query, params);
  return rows[0].total;
}
```

- [ ] **Step 2: Verificar que compila**

Run: `cd server && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 3: Commit**

```bash
git add server/src/models/cita.ts
git commit -m "feat(model): add cita model with CRUD and conflict detection"
```

---

### Task 3: Modelo Backend — horarioClinica.ts

**Files:**
- Create: `server/src/models/horarioClinica.ts`

**Interfaces:**
- Consumes: tabla `configuracion_horario` de PostgreSQL
- Produces: funciones `getAll()`, `updateAll(horarios[])`

- [ ] **Step 1: Crear `server/src/models/horarioClinica.ts`**

```typescript
import { pool } from '../config/database.js';

export interface HorarioInput {
  dia_semana: number;
  hora_apertura: string; // "08:00"
  hora_cierre: string;   // "18:00"
  es_laborable: boolean;
}

export async function getAll() {
  const { rows } = await pool.query(
    `SELECT * FROM configuracion_horario ORDER BY dia_semana ASC`
  );
  return rows;
}

export async function updateAll(horarios: HorarioInput[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const h of horarios) {
      await client.query(
        `INSERT INTO configuracion_horario (dia_semana, hora_apertura, hora_cierre, es_laborable, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (dia_semana) DO UPDATE SET
           hora_apertura = $2,
           hora_cierre = $3,
           es_laborable = $4,
           updated_at = NOW()`,
        [h.dia_semana, h.hora_apertura, h.hora_cierre, h.es_laborable]
      );
    }
    await client.query('COMMIT');
    return await getAll();
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

- [ ] **Step 2: Verificar que compila**

Run: `cd server && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 3: Commit**

```bash
git add server/src/models/horarioClinica.ts
git commit -m "feat(model): add horarioClinica model"
```

---

### Task 4: Rutas Backend — citas.ts y horarioClinica.ts

**Files:**
- Create: `server/src/routes/citas.ts`
- Create: `server/src/routes/horarioClinica.ts`
- Modify: `server/src/index.ts` (registrar rutas, líneas ~16-57)

**Interfaces:**
- Consumes: `cita.getAll`, `cita.getById`, `cita.create`, `cita.update`, `cita.updateEstado`, `cita.remove`, `cita.countToday`, `horarioClinica.getAll`, `horarioClinica.updateAll`
- Produces: endpoints REST `/api/citas` y `/api/horario-clinica`

- [ ] **Step 1: Crear `server/src/routes/citas.ts`**

```typescript
import { Router, Response } from 'express';
import { z } from 'zod';
import * as citaModel from '../models/cita.js';
import { authenticateToken, requireDoctorOrSecretaria, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const createCitaSchema = z.object({
  paciente_id: z.number().int().positive().nullable().optional(),
  doctor_id: z.number().int().positive(),
  tratamiento_id: z.number().int().positive().nullable().optional(),
  macro_tratamiento_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(1, 'El título es requerido'),
  notas: z.string().optional(),
  fecha_inicio: z.string().min(1),
  fecha_fin: z.string().min(1),
  estado: z.enum(['programada','confirmada','en_progreso','completada','cancelada','no_asistio']).optional(),
  es_nota_personal: z.boolean().optional(),
});

const updateEstadoSchema = z.object({
  estado: z.enum(['programada','confirmada','en_progreso','completada','cancelada','no_asistio']),
});

// GET /api/citas?doctor_id=&desde=&hasta=
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const filters: citaModel.CitaFilters = {};

  // Doctor solo ve sus propias citas
  if (user.rol === 'doctor') {
    filters.doctor_id = user.id;
  } else if (req.query.doctor_id) {
    filters.doctor_id = Number(req.query.doctor_id);
  }

  if (req.query.desde) filters.desde = req.query.desde as string;
  if (req.query.hasta) filters.hasta = req.query.hasta as string;

  const citas = await citaModel.getAll(filters);
  res.json(citas);
}));

// GET /api/citas/hoy/count
router.get('/hoy/count', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const doctorId = user.rol === 'doctor' ? user.id : undefined;
  const total = await citaModel.countToday(doctorId);
  res.json({ total });
}));

// GET /api/citas/:id
router.get('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const cita = await citaModel.getById(Number(req.params.id));
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

  // Doctor solo ve sus propias citas
  const user = req.user!;
  if (user.rol === 'doctor' && cita.doctor_id !== user.id) {
    return res.status(403).json({ error: 'No tiene acceso a esta cita' });
  }

  res.json(cita);
}));

// POST /api/citas
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const parsed = createCitaSchema.parse(req.body);

  // Doctor solo puede crear citas para sí mismo
  if (user.rol === 'doctor' && parsed.doctor_id !== user.id) {
    return res.status(403).json({ error: 'Solo puede crear citas para usted mismo' });
  }

  const result = await citaModel.create(parsed);
  if (result.conflict) {
    return res.status(409).json({ error: 'El doctor ya tiene una cita en ese horario' });
  }
  res.status(201).json(result.cita);
}));

// PUT /api/citas/:id
router.put('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const id = Number(req.params.id);

  // Verificar que existe y permisos
  const existing = await citaModel.getById(id);
  if (!existing) return res.status(404).json({ error: 'Cita no encontrada' });
  if (user.rol === 'doctor' && existing.doctor_id !== user.id) {
    return res.status(403).json({ error: 'No tiene acceso a esta cita' });
  }

  const parsed = createCitaSchema.partial().parse(req.body);
  // Mantener doctor_id original si el doctor edita
  if (user.rol === 'doctor') parsed.doctor_id = user.id;

  const result = await citaModel.update(id, { ...parsed, doctor_id: parsed.doctor_id ?? existing.doctor_id });
  if (result.conflict) {
    return res.status(409).json({ error: 'El doctor ya tiene una cita en ese horario' });
  }
  res.json(result.cita);
}));

// PATCH /api/citas/:id/estado
router.patch('/:id/estado', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const id = Number(req.params.id);

  const existing = await citaModel.getById(id);
  if (!existing) return res.status(404).json({ error: 'Cita no encontrada' });
  if (user.rol === 'doctor' && existing.doctor_id !== user.id) {
    return res.status(403).json({ error: 'No tiene acceso a esta cita' });
  }

  const { estado } = updateEstadoSchema.parse(req.body);
  const updated = await citaModel.updateEstado(id, estado);
  res.json(updated);
}));

// DELETE /api/citas/:id
router.delete('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const id = Number(req.params.id);

  const existing = await citaModel.getById(id);
  if (!existing) return res.status(404).json({ error: 'Cita no encontrada' });
  if (user.rol === 'doctor' && existing.doctor_id !== user.id) {
    return res.status(403).json({ error: 'No tiene acceso a esta cita' });
  }

  await citaModel.remove(id);
  res.json({ message: 'Cita eliminada' });
}));

export default router;
```

- [ ] **Step 2: Crear `server/src/routes/horarioClinica.ts`**

```typescript
import { Router, Response } from 'express';
import { z } from 'zod';
import * as horarioModel from '../models/horarioClinica.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const horarioSchema = z.array(z.object({
  dia_semana: z.number().int().min(0).max(6),
  hora_apertura: z.string().regex(/^\d{2}:\d{2}$/),
  hora_cierre: z.string().regex(/^\d{2}:\d{2}$/),
  es_laborable: z.boolean(),
}));

// GET /api/horario-clinica
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const horarios = await horarioModel.getAll();
  res.json(horarios);
}));

// PUT /api/horario-clinica
router.put('/', authenticateToken, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = horarioSchema.parse(req.body);
  const updated = await horarioModel.updateAll(parsed);
  res.json(updated);
}));

export default router;
```

- [ ] **Step 3: Registrar las rutas en `server/src/index.ts`**

Agregar estos imports después de la línea `import auditoriaRoutes from './routes/auditoria.js';` (línea 24):

```typescript
import citasRoutes from './routes/citas.js';
import horarioClinicaRoutes from './routes/horarioClinica.js';
```

Agregar estas líneas después de `app.use('/api/auditoria', auditoriaRoutes);` (línea 57):

```typescript
app.use('/api/citas', citasRoutes);
app.use('/api/horario-clinica', horarioClinicaRoutes);
```

- [ ] **Step 4: Verificar que compila**

Run: `cd server && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/citas.ts server/src/routes/horarioClinica.ts server/src/index.ts
git commit -m "feat(api): add REST endpoints for citas and horario-clinica"
```

---

### Task 5: Servicio Frontend — citaService.ts

**Files:**
- Create: `client/src/services/citaService.ts`
- Modify: `client/src/services/index.ts` (exportar servicio)

**Interfaces:**
- Consumes: `api.ts` (axios instance con baseURL `/api`)
- Produces: `citaService` con métodos `getAll(params)`, `getById(id)`, `create(data)`, `update(id, data)`, `updateEstado(id, estado)`, `remove(id)`, `countToday()`, `getHorarioClinica()`, `updateHorarioClinica(data)`

- [ ] **Step 1: Crear `client/src/services/citaService.ts`**

```typescript
import api from './api';

export interface Cita {
  id: number;
  paciente_id: number | null;
  doctor_id: number;
  tratamiento_id: number | null;
  macro_tratamiento_id: number | null;
  titulo: string;
  notas: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_asistio';
  es_nota_personal: boolean;
  paciente_nombre?: string;
  doctor_nombre?: string;
  macro_nombre?: string;
  created_at: string;
  updated_at: string;
}

export interface CitaInput {
  paciente_id?: number | null;
  doctor_id: number;
  tratamiento_id?: number | null;
  macro_tratamiento_id?: number | null;
  titulo: string;
  notas?: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado?: string;
  es_nota_personal?: boolean;
}

export interface HorarioClinica {
  id: number;
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
  es_laborable: boolean;
}

export const citaService = {
  async getAll(params?: { doctor_id?: number; desde?: string; hasta?: string }) {
    const res = await api.get('/citas', { params });
    return res.data as Cita[];
  },

  async getById(id: number) {
    const res = await api.get(`/citas/${id}`);
    return res.data as Cita;
  },

  async create(data: CitaInput) {
    const res = await api.post('/citas', data);
    return res.data as Cita;
  },

  async update(id: number, data: Partial<CitaInput>) {
    const res = await api.put(`/citas/${id}`, data);
    return res.data as Cita;
  },

  async updateEstado(id: number, estado: string) {
    const res = await api.patch(`/citas/${id}/estado`, { estado });
    return res.data as Cita;
  },

  async remove(id: number) {
    await api.delete(`/citas/${id}`);
  },

  async countToday() {
    const res = await api.get('/citas/hoy/count');
    return res.data.total as number;
  },

  async getHorarioClinica() {
    const res = await api.get('/horario-clinica');
    return res.data as HorarioClinica[];
  },

  async updateHorarioClinica(data: HorarioClinica[]) {
    const res = await api.put('/horario-clinica', data);
    return res.data as HorarioClinica[];
  },
};
```

- [ ] **Step 2: Exportar en `client/src/services/index.ts`**

Agregar al final del archivo:

```typescript
export { citaService } from './citaService';
```

- [ ] **Step 3: Verificar que compila**

Run: `cd client && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 4: Commit**

```bash
git add client/src/services/citaService.ts client/src/services/index.ts
git commit -m "feat(service): add citaService with all calendar API methods"
```

---

### Task 6: Componentes del Calendario — CalendarToolbar + AppointmentCard

**Files:**
- Create: `client/src/components/calendario/CalendarToolbar.tsx`
- Create: `client/src/components/calendario/AppointmentCard.tsx`

**Interfaces:**
- Consumes: tipos `Cita` de `citaService.ts`
- Produces: componentes `<CalendarToolbar>` y `<AppointmentCard>`

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

---

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

---

### Task 8: AppointmentModal + HorarioConfigModal

**Files:**
- Create: `client/src/components/calendario/AppointmentModal.tsx`
- Create: `client/src/components/calendario/HorarioConfigModal.tsx`
- Create: `client/src/components/calendario/DoctorFilter.tsx`

**Interfaces:**
- Consumes: `<Modal>` de `components/Modal.tsx`, `citaService`, `PacienteSearch`, tipos `Cita`, `CitaInput`, `HorarioClinica`
- Produces: componentes `<AppointmentModal>`, `<HorarioConfigModal>`, `<DoctorFilter>`

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

---

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

---

### Task 10: Integración — Ruta en App.tsx + Sidebar

**Files:**
- Modify: `client/src/App.tsx` (agregar lazy import + ruta)
- Modify: `client/src/components/Sidebar.tsx` (agregar item + badge de citas)

**Interfaces:**
- Consumes: `CalendarioPage`, `citaService.countToday()`
- Produces: ruta `/calendario` accesible y visible en sidebar con badge

- [ ] **Step 1: Agregar lazy import en `client/src/App.tsx`**

Después de la línea `const CierreCajaPage = lazy(...)` (línea 24), agregar:

```typescript
const CalendarioPage = lazy(() => import('./pages/CalendarioPage'));
```

- [ ] **Step 2: Agregar ruta en `client/src/App.tsx`**

Después del bloque de `CierreCajaPage` (después de línea 131), agregar:

```tsx
              <Route path="/calendario" element={<CalendarioPage />} />
```

- [ ] **Step 3: Agregar item en el Sidebar `client/src/components/Sidebar.tsx`**

En el array `menuItems` (después de la línea del Dashboard, línea 59), agregar este item:

```typescript
    { name: 'Calendario', path: '/calendario', icon: '📅', roles: ['admin', 'doctor', 'secretaria'] },
```

- [ ] **Step 4: Agregar badge de citas en el Sidebar**

En el Sidebar, agregar un nuevo estado junto al `notifCount` existente (después de línea 15):

```typescript
  const [citasHoyCount, setCitasHoyCount] = useState(0);
```

En el `useEffect` del `fetchNotif` (dentro del callback, después del bloque try/catch existente, ~línea 29), agregar:

```typescript
    // Contar citas de hoy
    try {
      const citasRes = await api.get('/citas/hoy/count');
      setCitasHoyCount(citasRes.data.total ?? 0);
    } catch { /* silencioso */ }
```

Y en el JSX del render, en el bloque donde se muestran badges (después de línea 93), agregar condición para Calendario:

```tsx
            {item.path === '/calendario' && citasHoyCount > 0 && (
              <span className="badge-notif">{citasHoyCount}</span>
            )}
```

- [ ] **Step 5: Verificar que compila**

Run: `cd client && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 6: Commit**

```bash
git add client/src/App.tsx client/src/components/Sidebar.tsx
git commit -m "feat(integration): add Calendario route and sidebar badge"
```

---

### Task 11: CSS del Calendario

**Files:**
- Modify: `client/src/styles/index.css` (agregar estilos del calendario al final)

**Interfaces:**
- Consumes: clases CSS usadas en Tasks 6-9
- Produces: estilos completos del módulo calendario

- [ ] **Step 1: Agregar estilos del calendario al final de `index.css`**

```css
/* ══════════════════════════════════════════════════════════════
   CALENDARIO CLÍNICO
   ══════════════════════════════════════════════════════════════ */

.calendario-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 2rem);
}

/* ── Toolbar ──────────────────────────────────────────────── */
.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-color, #e2e2e2);
  margin-bottom: 1rem;
}

.calendar-toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.calendar-toolbar-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1a1a2e);
}

.calendar-toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.calendar-view-toggle {
  display: flex;
  border: 1px solid var(--border-color, #e2e2e2);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-view-btn {
  padding: 0.4rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  color: var(--text-secondary, #666);
  transition: all 0.2s;
}

.calendar-view-btn.active {
  background: var(--brand-purple, #613192);
  color: #fff;
}

.calendar-view-btn:hover:not(.active) {
  background: var(--bg-hover, #f5f5f5);
}

.calendar-doctor-select {
  max-width: 200px;
  font-size: 0.85rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color, #e2e2e2);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary, #666);
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-hover, #f5f5f5);
  color: var(--brand-purple, #613192);
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

/* ── Calendar Body ────────────────────────────────────────── */
.calendar-body {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* ── Month View ───────────────────────────────────────────── */
.calendar-month-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.month-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--border-color, #e2e2e2);
}

.month-header-cell {
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--text-secondary, #666);
  text-transform: uppercase;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
}

.month-cell {
  border: 1px solid var(--border-color, #e2e2e2);
  border-top: none;
  border-left: none;
  padding: 0.4rem;
  min-height: 100px;
  cursor: pointer;
  transition: background 0.15s;
}

.month-cell:hover {
  background: var(--bg-hover, #faf8fc);
}

.month-cell.other-month {
  background: var(--bg-muted, #f9f9f9);
  opacity: 0.4;
  pointer-events: none;
}

.month-cell.today {
  background: rgba(97, 49, 146, 0.04);
}

.month-cell-day {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary, #666);
}

.month-cell-day.today-number {
  background: var(--brand-purple, #613192);
  color: #fff;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.month-cell-citas {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 0.25rem;
}

.month-cell-more {
  font-size: 0.7rem;
  color: var(--brand-purple, #613192);
  font-weight: 600;
  padding: 0 4px;
}

/* ── Week View ────────────────────────────────────────────── */
.calendar-week-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.week-header-row {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 2px solid var(--border-color, #e2e2e2);
  position: sticky;
  top: 0;
  background: var(--bg-primary, #fff);
  z-index: 5;
}

.week-header-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0;
  gap: 0.15rem;
}

.week-header-cell.today {
  color: var(--brand-purple, #613192);
}

.week-header-day {
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--text-secondary, #666);
}

.week-header-num {
  font-size: 1.1rem;
  font-weight: 600;
}

.week-header-num.today-number {
  background: var(--brand-purple, #613192);
  color: #fff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.week-body {
  flex: 1;
  overflow-y: auto;
}

.week-row {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  min-height: 40px;
}

.week-row.hour-start {
  border-top: 1px solid var(--border-color, #e2e2e2);
}

.week-time-gutter {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 8px;
  position: relative;
}

.week-time-label {
  font-size: 0.7rem;
  color: var(--text-secondary, #999);
  transform: translateY(-8px);
}

.week-cell {
  border-left: 1px solid var(--border-color, #eee);
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
  min-height: 40px;
}

.week-cell:hover {
  background: rgba(97, 49, 146, 0.03);
}

.week-cell.drag-over {
  background: rgba(0, 188, 212, 0.1);
  outline: 2px dashed var(--brand-turquoise, #00BCD4);
  outline-offset: -2px;
}

.week-appointment-wrapper {
  position: relative;
  z-index: 2;
}

/* ── Day View ─────────────────────────────────────────────── */
.calendar-day-view {
  position: relative;
  height: 100%;
  overflow-y: auto;
}

.day-row {
  display: grid;
  grid-template-columns: 70px 1fr;
  min-height: 50px;
}

.day-row.hour-start {
  border-top: 1px solid var(--border-color, #e2e2e2);
}

.day-time-gutter {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 12px;
}

.day-time-label {
  font-size: 0.75rem;
  color: var(--text-secondary, #999);
  transform: translateY(-8px);
  font-weight: 500;
}

.day-cell {
  border-left: 1px solid var(--border-color, #eee);
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
  padding: 2px 4px;
}

.day-cell:hover {
  background: rgba(97, 49, 146, 0.03);
}

.day-cell.drag-over {
  background: rgba(0, 188, 212, 0.1);
  outline: 2px dashed var(--brand-turquoise, #00BCD4);
  outline-offset: -2px;
}

.day-appointment-wrapper {
  position: relative;
  z-index: 2;
}

.day-now-line {
  position: absolute;
  left: 70px;
  right: 0;
  height: 2px;
  background: #E74C3C;
  z-index: 10;
  pointer-events: none;
}

.day-now-dot {
  position: absolute;
  left: -5px;
  top: -4px;
  width: 10px;
  height: 10px;
  background: #E74C3C;
  border-radius: 50%;
}

/* ── Appointment Card ─────────────────────────────────────── */
.appointment-card {
  background: var(--appointment-bg, rgba(0, 188, 212, 0.08));
  border-left: 3px solid var(--brand-turquoise, #00BCD4);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.15s;
  overflow: hidden;
}

.appointment-card:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.appointment-card.compact {
  padding: 2px 6px;
  font-size: 0.72rem;
}

.appointment-card.dimmed {
  opacity: 0.5;
}

.appointment-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.appointment-time {
  font-weight: 600;
  color: var(--text-primary, #333);
}

.appointment-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.appointment-card-body {
  display: flex;
  flex-direction: column;
}

.appointment-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-patient {
  font-size: 0.7rem;
  color: var(--text-secondary, #888);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Appointment Modal — Type Toggle ──────────────────────── */
.calendar-type-toggle {
  display: flex;
  border: 1px solid var(--border-color, #e2e2e2);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-type-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  color: var(--text-secondary, #666);
}

.calendar-type-btn.active {
  background: var(--brand-purple, #613192);
  color: #fff;
}

/* ── Form Row 3 Columns ──────────────────────────────────── */
.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

/* ── Horario Config ──────────────────────────────────────── */
.horario-config-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.horario-config-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.horario-config-row.disabled {
  opacity: 0.4;
}

.horario-day-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  font-weight: 500;
  cursor: pointer;
}

.horario-separator {
  color: var(--text-secondary, #999);
  font-size: 0.85rem;
}

.form-input-sm {
  padding: 0.35rem 0.5rem;
  font-size: 0.85rem;
  max-width: 110px;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .calendar-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .calendar-toolbar-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .calendar-doctor-select {
    max-width: 100%;
    flex: 1;
  }

  .form-row-3 {
    grid-template-columns: 1fr;
  }

  .month-cell {
    min-height: 60px;
    padding: 0.2rem;
  }

  .week-time-gutter,
  .day-time-gutter {
    width: 45px;
    min-width: 45px;
  }

  .week-header-row,
  .week-row {
    grid-template-columns: 45px repeat(7, 1fr);
  }

  .day-row {
    grid-template-columns: 45px 1fr;
  }
}
```

- [ ] **Step 2: Verificar visualmente**

Run: `cd client && npm run dev`
Navigate to: `/calendario`
Expected: Calendario visible con toolbar, vistas funcionales

- [ ] **Step 3: Commit**

```bash
git add client/src/styles/index.css
git commit -m "feat(css): add complete calendar module styles with Ventura branding"
```

---

### Task 12: Verificación Final

- [ ] **Step 1: Verificar compilación del servidor**

Run: `cd server && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 2: Verificar compilación del cliente**

Run: `cd client && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 3: Verificar build de producción**

Run: `cd client && npm run build`
Expected: Build exitoso sin warnings críticos

- [ ] **Step 4: Commit final y push**

```bash
git add -A
git commit -m "feat: complete calendar module with all views, drag&drop, and clinic hours config"
git push
```
