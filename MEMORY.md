# MEMORIA DE PROYECTO (Ventura Dental)

**Última actualización:** 25 de Abril 2026
**Checkpoint:** `CHECKPOINT_20260425.md`

---

## Estado Actual (25 de Abril, 2026)

| Aspecto | Estado |
|---------|--------|
| **Versión** | 2.0.0 |
| **Fase** | Pulir Funcionalidad |
| **Estética** | ✅ Completa (Marca Ventura + Minimalismo) |
| **Funcionalidad** | ⏳ Por revisar |

---

## Hitos Completados

### 2026-04-25 — Identidad de Marca + Minimalismo

1. **Logo oficial SVG** integrado en Sidebar y Login
2. **Paleta corporativa** sincronizada: `#613192` (púrpura), `#53b8c9` (turquesa)
3. **Minimalismo intencional** aplicado (sin glow, sin glassmorphism)
4. **Build verificado:** 0 errores, 18.57 kB CSS
5. **Checkpoint detallado** guardado en `CHECKPOINT_20260425.md`

---

## Arquitectura y Tecnologías

| Capa | Tecnología | Puerto |
|------|------------|--------|
| **Frontend** | React 18 + Vite + TypeScript | 5173 |
| **Backend** | Node + Express + TypeScript | 3000 |
| **DB** | PostgreSQL (Neon Serverless) | — |
| **Deploy Front** | Vercel | — |
| **Deploy Back** | Render | — |

**Diseño:** CSS Puro — Minimalismo + Marca Ventura (SIN TailwindCSS)

---

## Lecciones Aprendidas (Troubleshooting Completo)

### Despliegue
- **Cambios no se ven** → Redeploy en Vercel o Ctrl+Shift+R
- **Build aborta silenciosamente** → `npm run build` local primero
- **Git push falla** → Usar GitHub Personal Access Token (PAT)

### Código
- **Build lento** → Timeout 180s para builds completos
- **CSS "Unexpected }"** → Llave duplicada, revisar líneas cercanas
- **Import SVG** → `import Logo from '../assets/logo.svg'`

### Negocio
- **Saldo no disminuye** → Verificar `es_cuota_principal: true`
- **Race condition** → Usar `BEGIN` + `SELECT FOR UPDATE` + `COMMIT`

---

## Rollback Rápido

```powershell
# Restaurar CSS
Copy-Item "client\src\styles\backup-bento\index.css" "client\src\styles\index.css" -Force

# Reset hard
git reset --hard e6bfe2a
```

---

## Próximos Pasos (Funcionalidad)

1. **Alta prioridad:** Cobros, Dashboard, Cierre de Caja, Pacientes
2. **Media prioridad:** Auditoría, Macro Tratamientos, Mobile
3. **Largo plazo:** Notificaciones, Reportes PDF, Integraciones

---

## Recursos

- **Checkpoint:** `CHECKPOINT_20260425.md` (documento maestro)
- **Plan rediseño:** `PLAN_VENTURA_MINIMALISMO.md`
- **Contexto IA:** `AI_CONTEXT.md`
- **Docs técnicas:** `docs/MANUAL.md`, `docs/API.md`