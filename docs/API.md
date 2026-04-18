# Documentación de API - Ventura Dental
## Sistema de Facturación y Gestión Clínica

**Base URL:** `http://localhost:3001/api`  
**Formato:** JSON  
**Autenticación:** JWT (Bearer Token)

---

## 1. Autenticación (`/api/auth`)

### POST `/login`
Inicia sesión y obtiene el token.
- **Roles:** `admin`, `doctor`, `secretaria`.

### GET `/me`
Obtiene los datos del usuario autenticado.

---

## 2. Catálogo Clínico (`/api/tratamientosMacro`)

### GET `/`
Lista todos los **Procesos Clínicos** con sus procedimientos vinculados.
- **Estructura:** `[{ id, nombre, descripcion, micros: [...] }]`

### POST `/`
Crea un nuevo Proceso Clínico.

### POST `/micro`
Crea un **Procedimiento Clínico** vinculado a un proceso.
- **Campos clave:** `macro_tratamiento_id`, `nombre`, `precio` (en CRC).

---

## 3. Pacientes (`/api/pacientes`)

### GET `/buscar?q=`
Busca pacientes por nombre, DNI o teléfono.

### POST `/`
Registra un nuevo paciente.

---

## 4. Gestión de Tratamientos (`/api/tratamientos`)

### POST `/`
Crea un plan de tratamiento activo para un paciente.
- **Importante:** Los montos se registran siempre en **CRC**.

### GET `/paciente/:id`
Lista todos los tratamientos (activos, completados o cancelados) de un paciente.

---

## 5. Pagos y Caja (`/api/pagos`)

### POST `/` (Rol: Doctor)
Registra una **Intención de Pago**.
- **Payload:**
    ```json
    {
      "paciente_id": 123,
      "tratamiento_id": 45,
      "concepto": "Ajuste Ortodoncia",
      "moneda": "CRC",
      "detalles": [
        { "descripcion": "Control mensual", "monto": 35000, "es_cuota_principal": true }
      ]
    }
    ```
- **Estado inicial:** `pendiente_cobro`.

### GET `/pendientes` (Rol: Secretaria)
Lista los pagos pendientes de cobrar iniciados por los doctores.

### PUT `/:id/finalizar` (Rol: Secretaria)
Finaliza el cobro, captura la firma y genera el comprobante.
- **Payload:**
    ```json
    {
      "metodo_pago": "tarjeta",
      "moneda": "USD",
      "firma_dataurl": "data:image/png;base64...",
      "enviar_email": true
    }
    ```

### PUT `/:id/anular` (Rol: Admin)
Anula el pago y revierte el abono al saldo del tratamiento si fuera cuota principal.

---

## 6. Comprobantes (`/api/comprobantes`)

### GET `/:pagoId`
Obtiene el detalle del recibo generado. El número sigue el formato `YYYY-NNNN`.

---

## 7. Notificaciones (`/api/notificaciones`)

### GET `/`
Retorna notificaciones de pagos pendientes de leer.

---
**Ventura Dental - API v1.2**
