# MEMORIA DE PROYECTO (Ventura Dental)

**Última actualización:** 5 de Julio 2026 — 15:20 CRC
**Checkpoint:** `CHECKPOINT_27-06-2026.md` / Calendario Clínico Completado

---

## Estado Actual

| Aspecto | Estado |
|---------|--------|
| **Versión** | 2.1.0 |
| **Fase** | Módulo de Calendario Clínico Completado y verificado |
| **Módulos con marca** | 9/12 (Incluyendo Calendario) |
| **Flujo de negocio** | ✅ Revisado (Dashboard→Registrar→Cobros→Cierre→Calendario) |

---

## Hitos de la Sesión (5 de Julio 2026)

1. **Finalización del módulo Calendario Clínico** — Vistas mensual/semanal/diaria completas e integradas en Sidebar.
2. **Drag & Drop e interacciones** — Modificación visual y lógica de estados de citas (`programada`, `confirmada`, `en_progreso`, `completada`, etc.).
3. **Configuración de Horario Clínico** — Configuración visual de horas laborables por día de la semana.
4. **Verificación y compilación** — Limpieza de typescript compilation tanto en backend como frontend, con producción bundle (`npm run build`) exitoso.
5. **Cambios subidos** — Confirmados y subidos al repositorio remoto en `main`.

---

## Lecciones Aprendidas (Sesión 5 Julio)

| Problema | Solución |
|----------|---------|
| Auto-ejecución de scripts de base de datos en import | Se agregó un guard `const isMainModule` en `initDb.ts` para evitar auto-ejecuciones indeseadas al importar funciones. |
| Fallas de variables CSS dinámicas en tarjetas de citas | Se enlazaron las variables `--appointment-color` y `--appointment-color-glow` directamente desde `AppointmentCard.tsx`. |

---

## Arquitectura

| Capa | Tecnología | Puerto |
|------|------------|--------|
| **Frontend** | React 18 + Vite + TypeScript | 5173 |
| **Backend** | Node + Express + TypeScript | 3001 (Proxy configurado) |
| **DB** | PostgreSQL (pg nativo, sin ORM) | — |
| **Deploy Front** | Vercel | — |
| **Deploy Back** | Render | — |

**Diseño:** CSS Puro — Minimalismo de Marca Ventura con paleta púrpura/turquesa.

---

## Próximos Pasos

1. **Verificación en Producción / Staging** — Desplegar cambios y validar el comportamiento de citas bajo carga real.
2. **Alertas de Colisiones** — Opcionalmente agregar validación ante solapamiento de horarios al arrastrar citas.
3. **Módulos restantes** — Pacientes, Historial, Auditoría (verificar marca final).

---

## Rollback Rápido

```powershell
# Restaurar CSS
Copy-Item "client\src\styles\backup-bento\index.css" "client\src\styles\index.css" -Force

# Reset hard
git reset --hard e6bfe2a
```