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

Agregar estos imports después de `import auditoriaRoutes from './routes/auditoria.js';` (línea 24):

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
