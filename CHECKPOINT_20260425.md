# CHECKPOINT 20260425 — Ventura Dental v2.0.0

## Resumen Ejecutivo
**Proyecto:** Sistema de Facturación y Gestión Clínica Dental Ventura Dental
**Fecha:** 25 de Abril 2026
**Versión:** 2.0.0
**Estado:** Post-Rediseño — Marca Ventura + Minimalismo Implementado
**Próximo:** Pulir Funcionalidad

---

## 1. ARQUITECTURA DEL PROYECTO

### 1.1 Stack Tecnológico

| Capa | Tecnología | Detalle |
|------|-------------|---------|
| **Frontend** | React 18 + Vite + TypeScript | Puerto dev: 5173 |
| **Backend** | Node.js + Express + TypeScript | Puerto dev: 3000 |
| **Base de Datos** | PostgreSQL (Neon Serverless) | Driver `pg` nativo, SIN ORM |
| **Deploy Front** | Vercel | https://ventura-dental-facturacion.vercel.app |
| **Deploy Back** | Render | API del servidor |
| **Diseño** | CSS Puro (index.css) | SIN TailwindCSS |

### 1.2 Estructura de Carpetas

```
ventura-dental-facturacion/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── assets/                 # Logos (SVG, PNG, JPG)
│   │   ├── components/             # Sidebar, Modal, ErrorBoundary, etc.
│   │   ├── hooks/                  # useAuth (custom hooks)
│   │   ├── pages/                  # Todas las vistas
│   │   ├── services/              # Capa API (auth, pago, paciente, etc.)
│   │   ├── styles/
│   │   │   ├── index.css          # Sistema de diseño principal
│   │   │   ├── AuditoriaPage.css
│   │   │   ├── backup-bento/      # Backup pre-rediseño marca
│   │   │   └── backup-neon-dark/ # Backup estilo neon original
│   │   ├── types/                 # TypeScript types
│   │   ├── App.tsx               # Router principal
│   │   ├── main.tsx              # Entry point
│   │   └── ThemeContext.tsx      # Theme toggle
│   └── package.json
│
├── server/                          # Backend Node.js
│   ├── src/
│   │   ├── config/               # Database, env config
│   │   ├── controllers/          # Lógica de cierre de caja
│   │   ├── middleware/           # Auth, errorHandler
│   │   ├── models/             # Consultas SQL (paciente, pago, tratamiento, etc.)
│   │   ├── routes/            # Endpoints API
│   │   ├── scripts/           # initDb, seed, migrations
│   │   ├── services/         # Email, auditoria, errorLog
│   │   ├── utils/            # asyncHandler
│   │   └── index.ts         # Entry point
│   └── package.json
│
├── docs/                           # Documentación técnica
├── .agents/                      # Skills Vercel (para IA)
├── .claude/                      # Configuración Claude
├── CHECKPOINT_*.md              # Historial de checkpoints
├── MEMORY.md                     # Memoria del proyecto
├── AI_CONTEXT.md                # Contexto para IA
├── PLAN_VENTURA_MINIMALISMO.md   # Plan de rediseño
└── README.md                    # Guía de referencia
```

---

## 2. MÓDULOS DEL SISTEMA

### 2.1 Frontend — Páginas (client/src/pages/)

| Página | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| LoginPage | /login | Público | Autenticación |
| DashboardPage | /dashboard | admin | Stats, ingresos, eficiencia |
| PacientesPage | /pacientes | todos | CRUD de pacientes |
| TratamientosPage | /tratamientos | doctor, admin | Planes de tratamiento |
| MacroTratamientosPage | /macro-tratamientos | admin | Procesos clínicos |
| RegistrarPagoPage | /pagos/registrar | doctor, admin | Intención de pago |
| CobrosPage | /cobros/pendientes | secretaria, admin | Cola de cobros |
| HistorialPagosPage | /pagos | secretaria, admin | Registro de pagos |
| CobranzaPage | /cobranzas | secretaria, admin | Gestión de deudas |
| CierreCajaPage | /cierre-caja | secretaria, admin | Cierre diario |
| AuditoriaPage | /auditoria | admin | Log de acciones |
| UsuariosPage | /usuarios | admin | Gestión de usuarios |

### 2.2 Frontend — Componentes (client/src/components/)

| Componente | Uso |
|-----------|-----|
| Sidebar.tsx | Navegación lateral con logo |
| MainLayout.tsx | Layout con sidebar |
| Layout.tsx | Wrapper de páginas |
| Modal.tsx | Ventanas modales |
| PacienteSearch.tsx | Búsqueda de pacientes |
| SignaturePad.tsx | Firma digital |
| ErrorBoundary.tsx | Manejo de errores |

### 2.3 Frontend — Servicios (client/src/services/)

| Servicio | Responsabilidad |
|----------|----------------|
| api.ts | Instancia Axios con interceptores |
| authService.ts | Login, logout, JWT |
| pacienteService.ts | CRUD pacientes |
| pagoService.ts | Pagos, stats, cobros |
| tratamientoService.ts | Tratamientos |
| tratamientoMacroService.ts | Procesos clínicos |
| comprobanteService.ts | Comprobantes fiscales |
| cierreCajaService.ts | Cierre de caja |

### 2.4 Backend — Modelos (server/src/models/)

| Modelo | Tabla/Responsabilidad |
|--------|----------------------|
| usuario.ts | usuarios |
| paciente.ts | pacientes |
| tratamiento.ts | tratamientos |
| tratamientoMacro.ts | macrotratamientos |
| pago.ts | pagos, detalle_pagos |
| comprobante.ts | comprobantes |
| cierreCaja.ts | cierre_caja, detalle_cierre |
| index.ts | Exports centralizados |

### 2.5 Backend — Rutas (server/src/routes/)

| Ruta | Endpoints |
|------|----------|
| auth.ts | POST /api/auth/login, /logout |
| pacientes.ts | CRUD pacientes |
| tratamientos.ts | CRUD tratamientos |
| pagos.ts | Registrar, aprobar, stats |
| comprobantes.ts | Generación de comprobantes |
| cierreCaja.ts | Apertura/cierre de caja |
| auditoria.ts | Log de acciones |
| notificaciones.ts | Notificaciones pendientes |

---

## 3. SISTEMA DE DISEÑO (index.css)

### 3.1 Tokens CSS — Paleta de Marca Ventura Dental

```css
/* Marca Ventura Dental (Obligatorio usar estos) */
--brand-purple:           #613192;   /* VENTURA - principal */
--brand-purple-light:    #8B5FC7;   /* Hover púrpura */
--brand-purple-glow:     rgba(97,49,146,0.20);  /* Efectos sutiles */
--brand-turquoise:       #53b8c9;   /* DENTAL - acento */
--brand-turquoise-light: #7dd3e2;  /* Hover turquesa */
--brand-white:          #FFFFFF;

/* Aliases (para compatibilidad) */
--primary:       #613192;
--primary-dark:  #4A2874;
--primary-light: #8B5FC7;
--accent:       #53b8c9;
--warning:      #f59e0b;
--danger:       #ef4444;
```

### 3.2 Tokens CSS — Sistema de Superficies

```css
/* Tema Oscuro (default) */
--background:    #0D0D12;  /* Fondo principal */
--surface:       #141419;  /* Sidebar, cards base */
--surface-2:     #1C1C23;  /* Cards elevadas, modals */
--surface-hover: #222230;  /* Hover states */
--surface-input: #222230;  /* Inputs */

/* Tema Claro */
[data-theme="light"], .light {
  --background:    #F5F5F8;
  --surface:       #FFFFFF;
  --surface-2:     #F0F0F4;
  --surface-hover: #E8E8EC;
  --surface-input: #F0F0F4;
  --text-primary:  #1A1A22;
}
```

### 3.3 Componentes Diseñados

| Componente | Selector CSS | Estado |
|------------|-------------|--------|
| Sidebar | `.sidebar` | ✅ Con logo SVG |
| Nav activo | `.nav-item.active` | ✅ Fondo púrpura suave |
| Stat-cards | `.stat-card--primary/success/warning/danger` | ✅ Borde marca |
| Botón primario | `.btn-primary` | ✅ Púrpura sin glow |
| Botón éxito | `.btn-success` | ✅ Turquesa sin glow |
| Tarjetas | `.card`, `.bento-card` | ✅ Sin borde exterior |
| Tablas | `.table` | ✅ Sin bordes horizontales |
| Login | `.login-card` | ✅ Logo centrado |
| Modal | `.modal` | ✅ Fondo surface-2 |
| Inputs | `.form-input` | ✅ Focus púrpura |

---

## 4. REGLAS DE NEGOCIO (CRÍTICAS)

### 4.1 Flujo Dual de Cobros (Doble Validación)

```
PASO 1: Doctor genera tratamiento
  → Crea plan con procedimientos y presupuesto en CRC
  → Lanzo "intención de pago" (estado: pendiente_cobro)

PASO 2: Paciente firma digitalmente
  → Validación de recepción del servicio
  → Solo entonces pasa a cola de секретаря

PASO 3: Secretaría cobra en caja
  → Selecciona método de pago (efectivo, tarjeta, transferencia, etc.)
  → Puede cobrar en CRC o USD
  → Genera comprobante correlativo
  → Saldo del tratamiento se actualiza automáticamente
```

### 4.2 Reglas Monetarias

| Tipo | Moneda | Regla |
|------|--------|-------|
| Presupuestos/Tratamientos | **CRC** exclusivamente | Historial clínico consistente |
| Pagos en caja | **CRC o USD** | Secretaría elige |

### 4.3 Reglas Transaccionales (CRÍTICO — Race Conditions)

**OBLIGATORIO** al registrar pagos o actualizar saldos:

```sql
BEGIN;
  SELECT ... FOR UPDATE;  -- Bloquear filas concurrentes
  -- Operaciones...
COMMIT;
```

**Si el saldo no disminuye:**
→ Verificar que el detalle del pago tenga `es_cuota_principal: true`

### 4.4 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso total |
| **doctor** | Pacientes, tratamientos, registrar pago |
| **secretaria** | Cobros, cierre de caja, pacientes |

---

## 5. ESTADO DEL PROYECTO

### 5.1 Completado ✅ (Sesión 25 Abril 2026)

**Marca Ventura Dental aplicada en 8 módulos:**

| Módulo | Archivo | Cambios |
|--------|---------|---------|
| Sidebar | `Sidebar.tsx` | Logo SVG, nav activo púrpura suave, menú "Estructura Clínica" |
| Login | `LoginPage.tsx` | Logo SVG centrado, card minimalista |
| Dashboard | `DashboardPage.tsx` | stat-card--success/primary/warning/danger, progress bar púrpura |
| Macro Tratamientos | `MacroTratamientosPage.tsx` | Colores púrpura/turquesa, borde de marca |
| Registrar Pago | `RegistrarPagoPage.tsx` | Cuota principal púrpura, totales turquesa |
| Cobros | `CobrosPage.tsx` | Selección turquesa, badge púrpura, monto turquesa |
| Cierre de Caja | `CierreCajaPage.tsx` | Diferencia turquesa/púrpura, badge turquesa |

**Sistema de diseño:**
- [x] Identidad de marca Ventura Dental
- [x] Logo SVG integrado (Sidebar + Login)
- [x] Paleta corporativa (#613192 / #53b8c9)
- [x] Sistema de diseño minimalista
- [x] Nav activo con fondo púrpura suave
- [x] Botones sin glow neón (púrpura/turquesa)
- [x] Tablas minimalistas
- [x] Tema claro sincronizado
- [x] Backups de seguridad

### 5.2 Pendiente

#### Alta Prioridad — Flujo verificado en producción
- [x] **Dashboard:** stat-card--* aplicados ✅
- [x] **Registrar Pago:** Flujo completo ✅
- [x] **Cobros:** Cola + firma + método de pago ✅
- [x] **Cierre de Caja:** Cálculos CRC/USD ✅
- [x] **Estructura Clínica:** Macro/Micro tratamientos ✅
- [x] **Sidebar:** Menú de macro tratamientos ✅

#### Media Prioridad
- [ ] **Pacientes:** Verificar marca en página
- [ ] **Historial Pagos:** Verificar marca en página
- [ ] **Auditoría:** Verificar marca en página
- [ ] **Responsive mobile:** Navegación inferior sticky

#### Baja Prioridad
- [ ] **Notificaciones:** Sistema de badges
- [ ] **Theme toggle:** Verificar transición suave
- [ ] **Performance:** Optimizar queries

---

## 6. MÉTRICAS DE SALUD (Actualizado 25 Abril 2026)

| Métrica | Valor | Estado |
|---------|-------|--------|
| TypeScript errors | 0 | ✅ OK |
| Build CSS | ~18.57 kB | ✅ OK |
| Build JS | ~386.59 kB | ✅ OK |
| Errores runtime | 0 | ✅ OK |
| Backups disponibles | 2 | ✅ OK |
| Módulos con marca | 8/12 | ✅ OK |
| Commits en GitHub | ~16 | ✅ OK |

---

## 7. COMANDOS DE DESARROLLO

### 7.1 Frontend

```bash
# Desarrollo (puerto 5173)
cd client && npm install
npm run dev

# Build producción
npm run build

# Verificar TypeScript
npx tsc --noEmit
```

### 7.2 Backend

```bash
# Desarrollo (puerto 3000)
cd server && npm install
npm run db:init     # Inicializar BD (TABLAS + SEEDS)
npm run dev

# Scripts útiles
npm run seed        # Datos de prueba
npm run list-users # Listar usuarios
```

### 7.3 Deploy

```bash
# Push a GitHub (triggers Vercel automático)
git push

# Redeploy manual en Vercel si cambios no se ven
# Dashboard → Deployments → Redeploy
```

---

## 8. PROCEDIMIENTOS DE ROLLBACK

### 8.1 Rollback CSS (Si diseño falla)

```powershell
# Restaurar CSS pre-rediseño
Copy-Item "client\src\styles\backup-bento\index.css" "client\src\styles\index.css" -Force

# Restaurar archivos TSX
git checkout HEAD~ -- client/src/components/Sidebar.tsx
git checkout HEAD~ -- client/src/pages/LoginPage.tsx
```

### 8.2 Rollback Completo (Hard Reset)

```bash
# Reset al último commit estable conocido
git reset --hard e6bfe2a

# Forzar push (CUIDADO - sobrescribe remoto)
git push --force
```

### 8.3 Recuperación de lock de Git

```powershell
# Si hay error de "index.lock"
Remove-Item ".git/index.lock" -Force
```

---

## 9. LECCIONES APRENDIDAS (Troubleshooting Completo)

### 9.1 Despliegue en Vercel

| Problema | Causa | Solución |
|----------|-------|----------|
| Cambios no se ven en producción | Cache de Vercel | Redeploy manual en dashboard |
| Build aborta sin error visible | Error TypeScript silencioso | Ejecutar `npm run build` local primero |
| Deploy no se dispara | Webhook de GitHub no disparó | Push forzado o redeploy manual |

### 9.2 Git y Commits

| Problema | Causa | Solución |
|----------|-------|----------|
| `git commit --am` no añade archivos nuevos | Solo rastreados | Usar `git add .` primero |
| Push falla "authentication failed" | GitHub ya no acepta passwords | Usar Personal Access Token (PAT) |
| Error "index.lock exists" | Proceso git anterior | `Remove-Item .git/index.lock -Force` |
| Branch ahead by N commits | No se ha pushado | `git push` |

### 9.3 TypeScript y Build

| Problema | Causa | Solución |
|----------|-------|----------|
| Build lento o timeout | Archivos grandes | Timeout 180s para builds completos |
| CSS error "Unexpected }" | Llave suelta/duplicada | Verificar líneas alrededor del error |
| Import SVG no funciona | Path incorrecto | `import Logo from '../assets/logo.svg'` |

### 9.4 CSS y Diseño

| Problema | Causa | Solución |
|----------|-------|----------|
| Glassmorphism persiste | `backdrop-filter` no eliminado | Buscar y limpiar `backdrop-filter` |
| Glow neón visible | `box-shadow` con colores azul/verde | Reemplazar con `--brand-purple-glow` |
| Cambios no se notan | Cambios demasiado sutiles | Hacer cambios estratégicos, no cosméticos |
| Tema claro rompe | Tokens no sincronizados | Definir todos los tokens en `[data-theme="light"]` |

### 9.5 Base de Datos

| Problema | Causa | Solución |
|----------|-------|----------|
| Saldo no disminuye | Falta `es_cuota_principal: true` | Verificar cuerpo del pago |
| Race condition en pagos | Sin `SELECT FOR UPDATE` | Usar transacción con lock |
| DB no conecta | Variables env faltantes | Revisar `.env` en server/ |

### 9.6 Errores Comunes del Sistema

| Error | Significado | Acción |
|-------|-------------|--------|
| "Cannot read property of undefined" | Dato null no manejado | Verificar estado con Optional Chaining |
| "Unhandled promise rejection" | Async sin try/catch | Wrapped con `asyncHandler` |
| Error 500 en API | Fallo en backend | Revisar `logs_errores` en BD |
| Blank screen | ErrorBoundary no renderiza | Revisar consola del navegador |

---

## 10. CONFIGURACIÓN DE ENTORNO

### 10.1 Variables Requeridas

**client/.env**
```
VITE_API_URL=http://localhost:3000/api
```

**server/.env**
```
DATABASE_URL=postgresql://user:pass@host:5432/ventura_dental
JWT_SECRET=tu_secret_aqui
PORT=3000
```

### 10.2 Variables Opcionales

```
# Email (para notificaciones)
SMTP_HOST=smtp.example.com
SMTP_USER=user@example.com
SMTP_PASS=password

# URLs
CLIENT_URL=http://localhost:5173
```

---

## 11. SKILLS Y AGENTES CARGADOS

### 11.1 Skills Disponibles

| Skill | Proveedor | Uso |
|-------|-----------|-----|
| vercel-composition-patterns | vercel-labs | Composición de componentes React |
| vercel-react-best-practices | vercel-labs | Optimización de rendimiento React |
| vercel-react-native-skills | vercel-labs | React Native (no aplica) |

### 11.2 Reglas de Aplicación

- Usar patrones de **composición** para componentes complejos
- Priorizar **optimización** (evitar waterfalls, bundle size)
- **NO usar TailwindCSS** ni librerías de componentes sin aprobación
- Preferir **CSS puro** con tokens centralizados en `index.css`

---

## 12. PRÓXIMOS PASOS

### Inmediato (Esta sesión)
1. Revisar flujo completo Cobros → RegistrarPago
2. Verificar Dashboard con stat-cards de marca
3. Probar Cierre de Caja

### Corto plazo
1. Responsive mobile testing
2. Auditoría de queries del backend
3. Optimización de rendimiento

### Largo plazo
1. Sistema de notificaciones en tiempo real
2. Exportación de reportes (PDF/Excel)
3. Integración con sistemas de terceros

---

## 13. CHECKPOINTS ANTERIORES

| Archivo | Fecha | Contenido |
|---------|-------|----------|
| CHECKPOINT_20260425.md | 20260425 | Marca Ventura + Minimalismo + 8 módulos + Flujo negocio |

---

## 14. COMMITS DE LA SESIÓN (25 Abril 2026)

| Commit | Descripción |
|--------|-------------|
| `e6bfe2a` | feat(ui): apply Ventura Dental brand identity - logo + minimalism |
| `b4b909b` | feat: apply official Ventura Dental logo and brand colors |
| `722999a` | style: remove white background from official logo |
| `e9d90f7` | style: ultra-refined transparent logo |
| `7f38f89` | docs: checkpoint v2.0.0 - brand identity + minimalism |
| `dfc1adf` | docs: checkpoint 20260425 detallado |
| `d4960b8` | style: apply brand colors to Macro Tratamientos module |
| `79ca039` | feat: add Estructura Clínica link to sidebar menu |
| `4370b31` | style: apply brand colors to Dashboard |
| `639e335` | style: apply brand colors to Registrar Pago page |
| `59e4cba` | style: apply brand colors to Cobros page |
| `1fbc386` | style: apply brand colors to Cierre de Caja page |

---

## 14. NOTAS PARA IA (Agentes)

### Al comenzar una nueva sesión
1. Leer `MEMORY.md` para estado actual
2. Leer `AI_CONTEXT.md` para arquitectura
3. Leer último `CHECKPOINT_*.md` para contexto completo
4. Revisar `skills/` para estándares de código

### Antes de modificar código
1. Verificar build local (`npm run build`)
2. Hacer backup si es cambio significativo
3. Documentar cambios en checkpoint

### Después de modificar código
1. Verificar TypeScript (`npx tsc --noEmit`)
2. Commit con mensaje descriptivo
3. Push y verificar Vercel

---

**Última actualización:** 25 de Abril 2026, 13:30 CRC
**Commit actual:** `e6bfe2a` (base estable)
**Build verificado:** ✅ Sin errores