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
