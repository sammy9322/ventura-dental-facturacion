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
