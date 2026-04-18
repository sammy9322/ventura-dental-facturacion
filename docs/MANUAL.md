# Manual del Desarrollador - Ventura Dental
## Sistema de Gestión Clínica y Facturación

**Versión:** 1.2.0  
**Estado:** Producción  
**Última actualización:** 2026-04-13  

---

## 1. Arquitectura del Sistema

El sistema sigue una arquitectura de cliente-servidor desacoplada, optimizada para entornos de red local o despliegue en la nube.

### Stack Tecnológico
- **Frontend:** React + Vite + TypeScript. Usamos Vanilla CSS con variables nativas para el diseño.
- **Backend:** Node.js + Express + TypeScript.
- **Base de Datos:** PostgreSQL con persistencia directa mediante el driver `pg`.
- **Validación:** Zod para esquemas de datos tanto en frontend como en backend.

### Capas del Servidor
1.  **Routes:** Definición de endpoints y aplicación de middlewares de seguridad.
2.  **Middleware:** Autenticación JWT y control de acceso por roles (`admin`, `doctor`, `secretaria`).
3.  **Models:** Lógica de persistencia y transacciones SQL (ubicados en `server/src/models/`).
4.  **Services:** Lógica auxiliar (ej: envío de correos, generación de números de secuencia).

---

## 2. Base de Datos (PostgreSQL)

El esquema se gestiona a través del script `server/src/scripts/initDb.ts`. A continuación, se detallan las tablas principales y su propósito.

### Esquema de Tablas

| Tabla | Propósito |
| :--- | :--- |
| `usuarios` | Gestión de accesos con roles (admin, doctor, secretaria). |
| `pacientes` | Registro maestro de pacientes. |
| `tratamientos_macro` | **Procesos Clínicos** globales (ej: Ortodoncia, Endodoncia). |
| `tratamientos_micro` | **Procedimientos Clínicos** específicos con precios (ej: Limpieza Profunda). |
| `tratamientos` | Planes de tratamiento activos asignados a pacientes (**Presupuesto en CRC**). |
| `pagos` | Registro de intenciones de cobro y pagos finalizados. |
| `detalle_pago` | Desglosa los ítems cobrados en un solo pago. |
| `comprobantes` | Registro de recibos emitidos con numeración correlativa anual. |
| `notificaciones` | Alertas para la secretaría sobre pagos pendientes de cobrar. |

### Lógica de Transacciones Críticas
Para asegurar la integridad de los saldos, el modelo `pago.ts` utiliza `BEGIN`, `COMMIT` y bloques `FOR UPDATE` al consultar saldos de tratamientos. Esto evita que dos cobros simultáneos sobre un mismo tratamiento generen errores de saldo.

---

## 3. Lógica de Negocio y Flujos

### A. Terminología Clínica Estándar
Para mantener la coherencia entre el personal clínico y administrativo, se han definido los siguientes términos:
- **Proceso Clínico:** Categoría superior del catálogo (Ej: "Ortopedia").
- **Procedimiento Clínico:** Acción específica con un costo asociado (Ej: "Ajuste de Aparato").

### B. Flujo de Trabajo Dual (Doctor - Secretaria)
El sistema separa las responsabilidades para evitar errores financieros:
1.  **Doctor (Fase Clínica):**
    - Crea el plan de tratamiento (`tratamientos`).
    - Registra una intención de pago (`POST /api/pagos` con estado `pendiente_cobro`).
    - Define los detalles/procedimientos realizados en la cita.
2.  **Secretaria (Fase de Caja):**
    - Recibe una notificación en tiempo real.
    - Finaliza el cobro (`PUT /api/pagos/:id/finalizar`).
    - Selecciona el método de pago y la moneda (**CRC o USD**).
    - Captura la firma del paciente y emite el comprobante.

### C. Lógica Multi-Divisa (Moneda)
- **Presupuestos (Tratamientos):** Se manejan exclusivamente en **CRC (Colones)**. Esto garantiza que el saldo histórico del paciente no fluctúe con el tipo de cambio del mercado.
- **Cobros (Caja):** La secretaria puede procesar el pago en **CRC** o **USD**. El sistema registra la moneda utilizada en la tabla `pagos` para fines de cuadre de caja nocturno.

---

## 4. Interfaz y Patrones de Diseño (UI)

### Patrón Twin Panel (Catálogo)
En el módulo de **Estructura Clínica**, se aplica un diseño de "Paneles Gemelos":
- **Panel Izquierdo:** Lista de Procesos Clínicos con conteo de procedimientos.
- **Panel Derecho:** Detalle del proceso seleccionado, lista de procedimientos con precios y formulario de edición rápida.

### Estilo Visual
- **Temática:** Neon Dark Premium (Fidalgomorphism).
- **Colores:** Primario (#3b82f6), Acento (#10b981), Peligro (#ef4444).
- **Tipografía:** Inter / System UI.

---

## 5. API Endpoints

### Pagos (`/api/pagos`)
- `GET /`: Historial de pagos filtrado.
- `GET /pendientes`: Lista de cobros iniciados por doctores pendientes de finalizar.
- `POST /`: Registrar intención de pago (Doctor).
- `PUT /:id/finalizar`: Procesar cobro, firmar y generar comprobante (Secretaria).
- `PUT /:id/anular`: Solo administradores.

### Catálogo Clínico (`/api/tratamientosMacro`)
- `GET /`: Lista de Procesos con sus Procedimientos integrados.
- `POST /`: Crear nuevo proceso.
- `POST /micro`: Crear procedimiento vinculado.

---

## 6. Mantenimiento y Troubleshooting

### Inicialización de Datos
Si se requiere resetear o migrar la base de datos:
```bash
cd server
npm run db:init
```

### Problemas Comunes
1.  **"El pago excede el saldo":** El sistema valida que la "Cuota Principal" no supere lo que el paciente resta de pagar en su tratamiento activo.
2.  **Firma no guardada:** Asegurarse de que el string Base64 de la firma no esté truncado en el request (límite de tamaño de body en Express).

---
**Ventura Dental - 2026**
