# MEMORIA DE PROYECTO (Ventura Dental)

**Última actualización:** 25 de Abril 2026 — 14:00 CRC
**Checkpoint:** `CHECKPOINT_20260425.md`

---

## Estado Actual

| Aspecto | Estado |
|---------|--------|
| **Versión** | 2.0.0 |
| **Fase** | Marca aplicada — Verificar en producción |
| **Módulos con marca** | 8/12 |
| **Flujo de negocio** | ✅ Revisado (Dashboard→Registrar→Cobros→Cierre) |

---

## Hitos del Día (25 Abril 2026)

1. **Identidad de marca completa** — Logo SVG, paleta púrpura/turquesa
2. **Sistema de diseño minimalista** — Sin glow, sin glassmorphism
3. **Sidebar** — Logo + nav activo púrpura + menú "Estructura Clínica"
4. **Login** — Logo centrado
5. **Dashboard** — stat-cards con variantes de color de marca
6. **Macro Tratamientos** — Estructura clínica con marca
7. **Registrar Pago** — Flujo completo de intención de pago con marca
8. **Cobros** — Cola + firma + método de pago con marca
9. **Cierre de Caja** — Conciliación con marca
10. **Checkpoint detallado** — 545 líneas documentadas

---

## Lecciones Aprendidas (Sesión 25 Abril)

| Problema | Solución |
|----------|---------|
| Cambios no se ven en Vercel | Redeploy manual o Ctrl+Shift+R |
| Git push falla authentication | Usar GitHub PAT |
| Build lento/timeout | Timeout 180s para builds |
| CSS "Unexpected }" | Llave duplicada en edit |
| Módulo no aparece en menú | Falta en array `menuItems` del Sidebar |

---

## Arquitectura

| Capa | Tecnología | Puerto |
|------|------------|--------|
| **Frontend** | React 18 + Vite + TypeScript | 5173 |
| **Backend** | Node + Express + TypeScript | 3000 |
| **DB** | PostgreSQL (Neon Serverless) | — |
| **Deploy Front** | Vercel | — |
| **Deploy Back** | Render | — |

**Diseño:** CSS Puro — Minimalismo + Marca Ventura

---

## Próximos Pasos

1. **Verificar en producción** — Probar flujo completo en Vercel
2. **Módulos restantes** — Pacientes, Historial, Auditoría (verificar marca)
3. **Responsive mobile** — Testing
4. **Notificaciones** — Sistema de badges en tiempo real

---

## Recursos

- **Checkpoint:** `CHECKPOINT_20260425.md` (documento maestro — 545 líneas)
- **Plan rediseño:** `PLAN_VENTURA_MINIMALISMO.md`
- **Contexto IA:** `AI_CONTEXT.md`
- **Docs técnicas:** `docs/MANUAL.md`, `docs/API.md`

---

## Rollback Rápido

```powershell
# Restaurar CSS
Copy-Item "client\src\styles\backup-bento\index.css" "client\src\styles\index.css" -Force

# Reset hard
git reset --hard e6bfe2a
```