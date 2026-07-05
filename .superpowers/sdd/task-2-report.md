# Task 2 Report — cita.ts

## What I implemented

Created `server/src/models/cita.ts` with the following exported functions:

- **getAll(filters: CitaFilters)** — Fetches citas with optional doctor_id, desde, hasta filters. Joins pacientes, usuarios (doctor), and tratamientos_macro.
- **getById(id: number)** — Fetches a single cita by id with all joins including tratamientos.
- **create(data: CitaInput)** — Inserts a new cita within a transaction. Checks for time conflicts (overlapping appointments for the same doctor, excluding canceled/no_asistio). Returns `{ conflict: true }` on overlap.
- **update(id: number, data: Partial<CitaInput>)** — Partial update within a transaction. If fecha_inicio, fecha_fin, and doctor_id are all provided, checks for conflicts (excluding the current cita). Returns `{ conflict: true }` on overlap.
- **updateEstado(id: number, estado: string)** — Simple estado update, sets updated_at, returns the updated row.
- **remove(id: number)** — Hard delete, returns boolean.
- **countToday(doctorId?: number)** — Counts today's non-canceled/no_asistio citas, optionally filtered by doctor.

Also added `export * as citaModel from './cita.js'` to `server/src/models/index.ts`.

## Files changed

- `server/src/models/cita.ts` (created, 219 lines)
- `server/src/models/index.ts` (modified, 1 line added)

## Compilation check

Ran `npx tsc --noEmit` — **no errors**.

## Self-review findings

- Import uses `{ pool }` from `../config/database.js` (matching the brief), while other existing models use `{ query }`. Both are valid since database.ts exports both. The transactional functions (`create`, `update`) correctly use `pool.connect()` for client-scoped transactions.
- Existing models define return types explicitly (`as Paciente`), while the brief's code omits explicit typing. This is acceptable since TypeScript infers the types from `pool.query()`. The inconsistency is minor.
- The `remove` function does a hard delete rather than soft delete. This matches the brief but differs from `paciente.ts` which soft-deletes via `activo = false`. This is intentional per task spec.

## Issues or concerns

- None. Compilation passes cleanly.
