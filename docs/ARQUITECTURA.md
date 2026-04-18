# Ventura Dental - Arquitectura del Sistema
## Diseño y Lógica de Negocio

Este documento describe la arquitectura técnica y el flujo de datos de la plataforma Ventura Dental.

---

## 1. Stack Tecnológico
- **Frontend**: React 18 + Vite + TypeScript.
- **Backend**: Node.js + Express + TypeScript.
- **Base de Datos**: PostgreSQL (Persistencia directa con `pg`).
- **Arquitectura**: Cliente-Servidor Desacoplada.

---

## 2. Lógica de Persistencia y Transacciones

El núcleo transaccional del sistema reside en `server/src/models/pago.ts`, el cual garantiza la integridad de los datos financieros mediante:
- **Atomización:** El registro de un pago, la actualización del saldo del tratamiento y la generación del número de comprobante ocurren dentro de una sola transacción SQL.
- **Concurrencia:** Se utiliza `SELECT ... FOR UPDATE` para bloquear filas de tratamientos y secuencias durante el procesamiento del pago, evitando discrepancias en el saldo.

---

## 3. Modelo Clínico (Estructura de Datos)

El sistema organiza la actividad odontológica en dos niveles jerárquicos:
1.  **Proceso Clínico (Macro):** Agrupación lógica de procedimientos (ej: Ortodoncia).
2.  **Procedimiento Clínico (Micro):** Acción específica con precio definido en colones (ej: Limpieza Dental + Profilaxis).

### Reglas de Moneda
- **Presupuestos:** Siempre se calculan en **CRC (Colones)**.
- **Pagos:** Pueden registrarse en **CRC** o **USD**, capturando la moneda exacta recibida en Caja.

---

## 4. Flujo de Control Dual (Caja y Clínica)

Ventura Dental implementa un workflow de separación de deberes:

### Fase 1: Registro Clínico (Doctor)
- El Doctor registra los procedimientos realizados.
- El sistema calcula el monto basado en el catálogo clínico.
- Se crea una "Intención de Pago" (`pendiente_cobro`).

### Fase 2: Ejecución Financiera (Secretaria)
- La Secretaria recibe una notificación.
- Confirma el monto y procesa la transacción física.
- Captura la firma del paciente (Consentimiento de Pago).
- Se genera el **Recibo oficial con numeración correlativa anual**.

---

## 5. Diseño de Interfaz (CSS)

Se utiliza un sistema de diseño propio basado en **CSS Variables** (`client/src/styles/index.css`), priorizando:
- **Twin Panel:** Para la gestión de catálogos complejos.
- **Dark Mode Premium:** Para reducir la fatiga visual en el consultorio.
- **Responsividad:** Adaptado para tablets durante la firma del paciente.

---
**Ventura Dental - v1.2**
