# Ventura Dental - Sistema de Facturación y Gestión Clínica

Manual completo de referencia para el sistema de gestión odontológica **Ventura Dental**. Este documento sirve como guía para usuarios, administradores y desarrolladores.

---

## 🦷 Resumen del Proyecto
Ventura Dental es una plataforma integral diseñada para optimizar el flujo de trabajo financiero en clínicas dentales. Permite la gestión de pacientes, creación de planes de tratamiento, registro de pagos por parte de doctores y la fiscalización/cobro final por parte del personal administrativo.

---

## 🚀 Arquitectura Tecnológica

### Backend (Carpeta `/server`)
- **Entorno**: Node.js + Express
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **Conexión**: Driver `pg` nativo (uso de Pool para concurrencia).
- **Seguridad**: JWT (JSON Web Tokens) y cifrado de contraseñas con bcrypt.

### Frontend (Carpeta `/client`)
- **Framework**: React 18
- **Herramienta de Construcción**: Vite
- **Estética**: CSS Premium (Aesthetics-first) con diseño responsivo y animaciones fluidas.
- **Iconografía**: Lucide React
- **Estado**: React Hooks y Context API.

---

## 📋 Conceptos Clave y Terminología

Para mantener la coherencia clínica, el sistema utiliza la siguiente estructura:

1.  **Proceso Clínico:** Representa una categoría superior de tratamiento (ej. Ortodoncia, Estética Dental, Cirugía).
2.  **Procedimiento Clínico:** Acción específica dentro de un proceso (ej. Calza, Limpieza, Extracción de Cordal). Cada procedimiento tiene un precio sugerido en **Colones (CRC)**.
3.  **Plan de Tratamiento:** Conjunto de procedimientos asignados a un paciente con un presupuesto total definido en **CRC**.

---

## 💸 Flujo de Trabajo Financiero (Workflow)

El sistema implementa un modelo de "Doble Validación" para evitar errores contables:

### 1. Registro de Tratamiento
El doctor crea un "Tratamiento" para el paciente. Todos los presupuestos y saldos de tratamientos se manejan exclusivamente en **Colones (CRC)** para mantener la consistencia en el historial clínico.

### 2. Registro de Intención de Pago (Doctor)
- El doctor selecciona el paciente y los ítems a pagar (procedimientos o cuotas).
- El sistema genera un pago en estado **"Pendiente de Cobro"**.
- El paciente firma digitalmente en la pantalla del doctor para validar la recepción del servicio.

### 3. Ejecución del Cobro (Secretaría/Caja)
- La secretaria accede a la cola de aprobación.
- Selecciona el método de pago (Efectivo, Tarjeta, Transferencia, etc.).
- **Multi-moneda**: Puede decidir cobrar en **CRC** o **USD**. El sistema registrará el monto en la moneda elegida.
- Al finalizar, el saldo del tratamiento del paciente se actualiza automáticamente.

---

## 🛠️ Guía del Desarrollador

### Instalación Local

1.  **Base de Datos**:
    Asegúrese de tener PostgreSQL activo y cree la base de datos `ventura_dental`.
2.  **Configuración de Variables**:
    Cree archivos `.env` en `/server` y `/client` (puerto default 3001 para server).
3.  **Ejecución**:
    ```bash
    # Terminal 1: Servidor
    cd server
    npm install
    npm run db:init     # Inicializa tablas y seeds
    npm run dev

    # Terminal 2: Cliente
    cd client
    npm install
    npm run dev
    ```

### Estándares de Código
- **Tipado**: Todos los modelos deben estar reflejados en `/client/src/types/index.ts`.
- **UI**: Las nuevas funcionalidades deben seguir el diseño premium establecido en `index.css`.
- **Servicios**: Toda comunicación con la API debe pasar por la capa de servicios en `/client/src/services`.

---

## 💾 Documentación Adicional
- `docs/MANUAL.md`: Guía técnica detallada y esquemas de base de datos.
- `docs/API.md`: Documentación de endpoints.
- `docs/HANDOVER.md`: Guía de mantenimiento y pendientes.

---

**Desarrollado para:** Clínica Ventura Dental
**Última Actualización:** Abril 2026
