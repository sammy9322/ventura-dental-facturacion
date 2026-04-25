# PLAN: Rediseño Bento Minimal — Ventura Dental

## ESTADO ACTUAL
- ✅ FASE 0 COMPLETADA: Backup en `client/src/styles/backup-neon-dark/` (index.css, mejoras.css, AuditoriaPage.css)
- ⏳ FASE 1-4 PENDIENTES

## REGLA DE ORO
**Cero cambios en archivos `.tsx`** (solo 1 línea en App.tsx). Todo el rediseño es CSS puro.

## ROLLBACK
```powershell
Copy-Item "client\src\styles\backup-neon-dark\*" "client\src\styles\" -Force
# + restaurar en App.tsx: import './styles/mejoras.css';
```

---

## FASE 1 — Consolidar CSS
- Eliminar import de `mejoras.css` en `App.tsx` (causa conflictos con `!important`)
- Absorber sus estilos útiles (scrollbar, theme transition) en `index.css`

## FASE 2 — Nuevos Tokens CSS en `index.css`

| Token | Antes | Después |
|---|---|---|
| `--background` | `#0f172a` | `#0f1117` |
| `--surface` | `#1e293b` | `#161b27` |
| `--surface-2` | `#273448` | `#1e2535` |
| `--border` | `#334155` | `rgba(255,255,255,0.08)` |
| `--radius` | `10px` | `12px` |
| `--radius-lg` | `16px` | `18px` |
| `--radius-xl` | *(no existe)* | `24px` |
| `--shadow` | opaco/duro | `0 2px 8px rgba(0,0,0,0.25)` |
| `--shadow-card` | *(no existe)* | `0 1px 3px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.15)` |

### Cambios por componente
| Componente | Cambio |
|---|---|
| `.sidebar` | Eliminar `backdrop-filter:blur(16px)` → fondo sólido + borde sutil |
| `.nav-item.active` | Sin glow/neon → fondo sólido primario baja opacidad |
| `.stat-card` | Borde superior 2px: azul/verde/naranja según tipo |
| `.modal` | Sin glassmorphism → bordes Bento limpios |
| `.login-card` | Sin glassmorphism → fondo sólido |
| `.table th` | Más sutil, sin color agresivo |
| `.filtros-bar` | Estilo Bento flat |
| Tipografía | Fuente Geist (fallback: Inter) vía @import Google Fonts |

### Nuevas clases de utilidad (sin tocar HTML)
```css
.bento-card         /* tarjeta base */
.bento-card-accent  /* borde izquierdo color primario */
.bento-card-flat    /* para fondos anidados */
.stat-card--primary /* borde top azul */
.stat-card--success /* borde top verde */
.stat-card--warning /* borde top naranja */
```

## FASE 3 — Refinamiento por Página (solo CSS)
| Página | Ajuste |
|---|---|
| LoginPage | `.login-card`: fondo sólido |
| DashboardPage | `.stats-grid` + `.stat-card`: borde top por color |
| MacroTratamientosPage | `.grid-catalog`: gap y padding panel dual |
| CobrosPage / RegistrarPagoPage | `.paciente-info`: Bento flat |
| AuditoriaPage | `AuditoriaPage.css`: alinear al nuevo sistema |
| Modales (todos) | `.modal`: sin glassmorphism |
| Filtros | `.filtros-bar`: Bento flat |

## FASE 4 — Verificación
```bash
cd client && npm run build   # 0 errores antes de push a Vercel
```
Verificar visualmente: Login, Dashboard, MacroTratamientos, Cobros, Mobile ≤640px

## ARCHIVOS A MODIFICAR
- `client/src/styles/index.css` — reescritura de tokens y componentes
- `client/src/styles/AuditoriaPage.css` — alinear colores
- `client/src/App.tsx` — eliminar 1 línea: `import './styles/mejoras.css';`
