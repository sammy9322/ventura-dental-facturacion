# Calendario Clínico — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Construir un módulo de calendario clínico completo con vistas mensual/semanal/diaria, drag & drop, estados de cita, notas personales, y configuración de horarios.

**Architecture:** Backend REST (Express + PostgreSQL) con modelo cita y configuracion_horario. Frontend React con componentes modulares en client/src/components/calendario/. Página principal CalendarioPage.tsx. CSS puro siguiendo la marca Ventura.

**Tech Stack:** React 18 + TypeScript, Node/Express + TypeScript, PostgreSQL (pg nativo), CSS puro, HTML5 Drag API, Zod (validación), lucide-react (iconos).

## Global Constraints

- **CSS:** Vanilla CSS solamente. Sin TailwindCSS. Seguir paleta --brand-purple: #613192, --brand-turquoise: #00BCD4, --brand-white: #FFFFFF.
- **DB:** PostgreSQL con driver pg nativo. Sin ORM. Usar BEGIN/COMMIT para transacciones.
- **Errores:** Rutas backend envueltas en asyncHandler. Frontend con ErrorBoundary.
- **Validación:** Usar zod para schemas de entrada.
- **Imports:** Usar extensión .js en imports del backend (ESM).
- **Auth:** Usar authenticateToken + guards de rol del middleware existente.
