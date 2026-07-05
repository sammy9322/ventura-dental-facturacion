### Task 1: Migración de Base de Datos (tablas citas + configuracion_horario)

**Files:**
- Modify: `server/src/scripts/initDb.ts` (agregar tablas al final, antes del COMMIT)

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
