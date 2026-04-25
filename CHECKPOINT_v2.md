# CHECKPOINT — Ventura Dental v2.0.0 (25 Abril 2026)

## Estado del Proyecto
**Fase:** Post-Rediseño / Pulir Funcionalidad
**Build:** 18.57 kB CSS | 386.59 kB JS | 0 errores TypeScript
**Último deploy:** [ventura-dental-facturacion.vercel.app](https://ventura-dental-facturacion.vercel.app)

---

## ✅ Completado: Identidad de Marca + Minimalismo

### Branding Ventura Dental
| Elemento | Estado |
|----------|--------|
| Logo oficial SVG (púrpura + turquesa) | ✅ Sidebar + Login |
| Paleta CSS `#613192` / `#00BCD4` / `#FFFFFF` | ✅ Aplicada globalmente |
| Nav activo con fondo púrpura suave | ✅ Implementado |

### Sistema de Diseño
| Componente | Estado |
|------------|--------|
| Sistema de tokens CSS (superficies) | ✅ Implementado |
| Sidebar con logo + elevación diferenciada | ✅ Implementado |
| Login con logo de marca | ✅ Implementado |
| Botones (púrpura/turquesa, sin glow) | ✅ Implementado |
| Stat-cards con borde de marca | ✅ Implementado |
| Tablas minimalistas (sin bordes horizontales) | ✅ Implementado |
| Tema claro sincronizado | ✅ Implementado |

### Stack Tecnológico (sin cambios)
- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **DB:** PostgreSQL (driver `pg` nativo, sin ORM)
- **Diseño:** CSS puro (index.css) — Sin Tailwind

---

## 📋 Funcionalidad por Pulir (Pendiente)

### Alta Prioridad
- [ ] **Cobros/RegistrarPago:** Flujo completo de intención de pago
- [ ] **Dashboard:** Verificar que stat-cards usen las variantes de color
- [ ] **Cierre de Caja:** Verificar cálculos de totales
- [ ] **Pacientes:** CRUD completo con búsqueda

### Media Prioridad
- [ ] **Auditoría:** Verificar logueo de acciones
- [ ] **Macro Tratamientos:** Panel dual funcional
- [ ] **Responsive mobile:** Navegación inferior sticky

### Baja Prioridad
- [ ] **Notificaciones:** Sistema de badges
- [ ] **Tema claro:** Verificar contraste
- [ ] **Performance:** Optimizar queries del backend

---

## 📁 Estructura de Archivos Clave

### Frontend
```
client/src/
├── assets/          logo.svg, logo-sidebar.svg, logo_original.jpg
├── components/      Sidebar.tsx, MainLayout.tsx, Modal.tsx, ...
├── pages/           Dashboard, Pacientes, Cobros, RegistrarPago, ...
├── services/        api.ts, authService.ts, pagoService.ts, ...
├── styles/
│   └── index.css   Sistema de diseño (tokens + componentes)
├── styles/
│   ├── backup-bento/        Backup pre-rediseño marca
│   └── backup-neon-dark/    Backup estilo neon original
└── ThemeContext.tsx
```

### Backend
```
server/src/
├── models/         paciente.ts, pago.ts, tratamiento.ts, ...
├── routes/         pacientes.ts, pagos.ts, auth.ts, ...
├── controllers/    cierreCajaController.ts
├── scripts/        initDb.ts, seedDb.ts, migrate*.ts
└── config/        database.ts, index.ts
```

---

## 🔐 Reglas de Negocio (Contexto Crítico)

### Flujo Dual de Cobros
1. **Doctor →** Genera tratamiento + lanza "intención de pago" (`pendiente_cobro`)
2. **Paciente →** Firma digitalmente
3. **Secretaria →** Cobra, elige método/moneda, genera comprobante

### Transacciones (CRÍTICO — Race Conditions)
- Usar **SIEMPRE** `BEGIN`, `COMMIT`, `SELECT ... FOR UPDATE` al registrar pagos
- Los presupuestos/tratamientos se fijan en **CRC**
- Los pagos en caja pueden ser **CRC o USD**

### Si el saldo no disminuye
- Verificar que el detalle del pago tenga `es_cuota_principal: true`

---

## 🛠️ Comandos de Desarrollo

```bash
# Frontend
cd client && npm run dev     # Puerto 5173
cd client && npm run build  # Producción

# Backend
cd server && npm run dev   # Puerto 3000
cd server && npm run db:init  # Resetear BD

# Deploy
git push  # Trigger Vercel automáticamente
```

---

## 🔄 Rollback (Si algo falla)

```powershell
# Restaurar CSS pre-marca
Copy-Item "client\src\styles\backup-bento\index.css" "client\src\styles\index.css" -Force

# Restaurar Sidebar original
git checkout HEAD~ -- client/src/components/Sidebar.tsx
git checkout HEAD~ -- client/src/pages/LoginPage.tsx

# Hard reset (si es necesario)
git reset --hard e6bfe2a  # Último commit conocido estable
```

---

## 📊 Métricas de Salud

| Métrica | Valor |
|---------|-------|
| Build | ✅ Sin errores |
| TypeScript | ✅ 0 errores |
| CSS | 18.57 kB |
| JS | 386.59 kB |
| Commits locales | 10 por push |
| Backups | 2 (bento + neon-dark) |

---

## 📝 Lecciones Aprendidas

- **Vercel cache:** Si cambios no se ven, usar Ctrl+Shift+R o redeploy manual
- **Git push fallido:** Usar Personal Access Token (PAT) de GitHub
- **Build lento:** Timeout extendido a 180s para builds completos
- **Errores CSS:** Verificar build local antes de subir
- **Logo SVG:** Usar `import Logo from '../assets/logo.svg'` en React

---

> **Última actualización:** 25 Abril 2026, 13:00 CRC
> **Próximo checkpoint:** Después de pulir funcional