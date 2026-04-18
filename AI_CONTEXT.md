# Contexto Maestro Inteligencia Artificial (AI Context) - Ventura Dental

Este archivo condensa la arquitectura, reglas de negocio y estado del proyecto **Ventura Dental** para agilizar la inmersión de cualquier agente de IA.

## 1. Core Técnico & Stack
- **Arquitectura:** Cliente-Servidor (Monorepositorio).
- **Frontend:** React 18 + Vite + TypeScript.
- **Backend:** Node.js + Express + TypeScript.
- **DB:** PostgreSQL (Manejado directamente con el driver `pg`, **NO usamos ORM** como Prisma o TypeORM para las transacciones financieras).
- **Diseño (UI):** Vanilla HTML/CSS (`client/src/styles/index.css`). **Regla estricta:** No introducir TailwindCSS ni librerías de componentes externas sin aprobación. Diseño "Neon Dark Premium" (Fidalgomorphism) y "Twin Panels" para catálogos.

## 2. Lógica de Dominio y Negocio
- **Estructura Clínica:**
  - `Tratamientos Macro`: Categorías (Ej. "Ortodoncia"). En UI se llaman **Procesos Clínicos**.
  - `Tratamientos Micro`: Procedimientos específicos con precio (Ej. "Ajuste mensual"). En UI se llaman **Procedimientos Clínicos**.
- **Flujo Dual de Cobros (Separación de roles):**
  1. **Doctor/Admin (Consultorio):** Genera el tratamiento base, registra la actividad clínica y lanza una "intención de pago" (`pendiente_cobro`).
  2. **Secretaria/Admin (Caja):** Recibe la intención, elige el método de pago, cobra, captura la **firma digital** del paciente y genera el comprobante correlativo.
- **Reglas Monetarias:** Los *presupuestos/tratamientos* se fijan siempre en **CRC (Colones)**. Los *pagos en caja* pueden registrarse en **CRC o USD**.

## 3. Arquitectura Transaccional y Persistencia
- Las consultas a la BD están en `server/src/models/`.
- **Regla Estricta (Race Conditions):** Al registrar un pago o actualizar el saldo de un tratamiento, se obliga el uso de `BEGIN`, `COMMIT`, y especialmente `SELECT ... FOR UPDATE` para bloquear filas concurrentes.
- El esquema SQL maestro se encuentra en `server/src/scripts/initDb.ts`.

## 4. Arquitectura de Resiliencia (Última actualización)
- **Frontend:** Uso intensivo de `ErrorBoundary.tsx` para envolver rutas/módulos. Si un módulo falla, la UI muestra una vista de recuperación en lugar de pantallazo blanco.
- **Backend:** Las rutas están envueltas obligatoriamente en un utilitario `asyncHandler` (`server/src/utils/asyncHandler.ts`) para evitar caídas `unhandledRejection`.
- **Auditoría de Errores:** Errores 500 no capturados se almacenan proactivamente en la tabla PostgreSQL `logs_errores` para debugging administrado. Procesos protegidos por señales térmicas (`SIGTERM`, `Graceful Shutdown`).

## 5. Troubleshooting y Rutas Clave
- Si "El saldo de un paciente no disminuye", verificar que el detalle enviado como cuerpo del pago tenga el flag `es_cuota_principal: true`.
- Entorno de desarrollo: `npm run dev` (Cliente: 5173, Servidor: 3000).
- Reinicio/Migración de BD local: `cd server && npm run db:init`.
