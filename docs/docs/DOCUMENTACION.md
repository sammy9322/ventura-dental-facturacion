# Ventura Dental - Sistema de Facturación Clínica

Sistema de gestión de pagos y comprobantes para consultorios dentales.

## Características

- Autenticación con roles (Administrador/Cajero)
- Gestión de pacientes con datos completos
- Gestión de tratamientos (ortodoncia, endodoncia, etc.)
- Pagos en cuotas para tratamientos
- Firma digital en pantalla
- Generación de comprobantes imprimibles
- Dashboard con estadísticas
- Historial de pagos con filtros

---

## Tecnologías

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + pg
- JWT (autenticación)
- bcrypt (contraseñas)
- Zod (validación)

### Frontend
- React 18 + Vite + TypeScript
- React Router
- React Hook Form
- Axios

---

## Estructura del Proyecto

```
ventura-dental-facturacion/
├── server/src/
│   ├── config/database.ts     # Conexión PostgreSQL
│   ├── middleware/auth.ts    # Autenticación JWT
│   ├── models/              # Modelos (usuario,paciente,pago,tratamiento,comprobante)
│   ├── routes/              # API Routes
│   ├── scripts/initDb.ts   # Inicialización BD
│   ├── scripts/seedDb.ts  # Datos iniciales
│   └── index.ts            # Entry point
├── client/src/
│   ├── components/          # Layout, Modal, PacienteSearch, SignaturePad
│   ├── pages/             # Login, Dashboard, Pagos, Tratamientos, Pacientes, Usuarios
│   ├── services/          # API, Auth, Paciente, Pago, Tratamiento, Comprobante
│   ├── hooks/useAuth.ts    # Hook autenticación
│   └── App.tsx            # Componente principal
└── docs/                 # Documentación
```

---

## Tipos de Tratamiento

- ortodoncia - Pagos en cuotas
- endodoncia - Tratamiento de conducto
- limpieza - Limpieza dental
- corona - Corona dental
- extraccion - Extracción
- blanqueamiento - Blanqueamiento
- implante - Implante dental
- ortopedia - Ortopedia
- resina - Resina
- otro - Otro tratamiento

---

## Métodos de Pago

- Efectivo
- Tarjeta (débito/crédito)
- Transferencia bancaria
- Yape
- Plin

---

## Roles de Usuario

- **admin**: Acceso total, gestión de usuarios
- **cajero**: Registrar pagos, gestionar pacientes

---

## Instalación

```bash
# 1. PostgreSQL (Postgres.app)
# 2. Crear DB: ventura_dental
# 3. Backend
cd server && npm install && npm run dev
# 4. Frontend
cd client && npm install && npm run dev
# 5. Abrir: http://localhost:5173
```

## Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | Administrador |
| caja | caja123 | Cajero |

---

## Base de Datos

### Tablas

**usuarios**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | PK |
| username | VARCHAR(50) | Login |
| password_hash | VARCHAR(255) | bcrypt |
| nombre_completo | VARCHAR(100) | Nombre |
| rol | VARCHAR(20) | admin/cajero |
| activo | BOOLEAN | Estado |
| created_at | TIMESTAMP | Creación |

**pacientes**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | PK |
| nombre | VARCHAR(150) | Nombre |
| dni | VARCHAR(8) | DNI (único) |
| telefono | VARCHAR(20) | Teléfono |
| email | VARCHAR(100) | Email |
| direccion | TEXT | Dirección |
| activo | BOOLEAN | Estado |
| created_at | TIMESTAMP | Creación |

**tratamientos**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | PK |
| paciente_id | INTEGER | FK |
| tipo | VARCHAR(50) | Tipo tratamiento |
| descripcion | TEXT | Detalles |
| monto_total | DECIMAL(10,2) | Total |
| monto_pagado | DECIMAL(10,2) | Pagado |
| fecha_inicio | DATE | Inicio |
| fecha_fin | DATE | Fin (nullable) |
| estado | VARCHAR(20) | activo/completado/cancelado |

**pagos**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | PK |
| paciente_id | INTEGER | FK |
| usuario_id | INTEGER | FK |
| monto | DECIMAL(10,2) | Monto |
| metodo_pago | VARCHAR(30) | Método |
| concepto | TEXT | Descripción |
| firma_dataurl | TEXT | FirmaBase64 |
| estado | VARCHAR(20) | pendiente/completado/anulado |
| created_at | TIMESTAMP | Fecha |

**comprobantes**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | PK |
| pago_id | INTEGER | FK (único) |
| numero | VARCHAR(20) | Número |
| created_at | TIMESTAMP | Creación |

**pago_tratamientos**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | PK |
| pago_id | INTEGER | FK |
| tratamiento_id | INTEGER | FK |
| monto_asignado | DECIMAL(10,2) | Monto |

**sequence_comprobantes**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | PK |
| ultimo_numero | INTEGER | Último número |
| anio | INTEGER | Año |

---

## API Endpoints

### Base URL: http://localhost:3001/api

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /auth/login | Login |
| GET | /auth/me | Usuario actual |
| GET | /auth/usuarios | Listar usuarios (admin) |
| POST | /auth/usuarios | Crear usuario (admin) |
| PUT | /auth/usuarios/:id | Actualizar usuario |
| PUT | /auth/usuarios/:id/password | Cambiar contraseña |

### Pacientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /pacientes | Listar |
| GET | /pacientes/buscar?q= | Buscar |
| GET | /pacientes/:id | Por ID |
| GET | /pacientes/dni/:dni | Por DNI |
| POST | /pacientes | Crear |
| PUT | /pacientes/:id | Actualizar |
| DELETE | /pacientes/:id | Desactivar |

### Tratamientos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /tratamientos | Listar |
| GET | /tratamientos/paciente/:id | De paciente |
| GET | /tratamientos/:id | Por ID |
| GET | /tratamientos/:id/saldo | Saldo |
| POST | /tratamientos | Crear |
| PUT | /tratamientos/:id | Actualizar |
| DELETE | /tratamientos/:id | Cancelar |

### Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /pagos | Listar (filtros) |
| GET | /pagos/stats | Estadísticas |
| GET | /pagos/:id | Por ID |
| POST | /pagos | Registrar |
| PUT | /pagos/:id/firma | Actualizar firma |
| PUT | /pagos/:id/anular | Anular (admin) |

### Comprobantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /comprobantes/:pagoId | Por pago |
| GET | /comprobantes/numero/:numero | Por número |

---

## Fórmulas

### Saldo Tratamiento
```
saldo = monto_total - monto_pagado
```

### Actualización Monto Pagado
```
monto_pagado = monto_pagado + pago.monto
estado = 'completado' si monto_pagado >= monto_total
```

### Número Comprobante
```
numero = ultimo_numero + 1
(se reinicia cada año)
```

---

## Flujo: Registro de Pago

1. Cajero inicia sesión
2. Ve a "Nuevo Pago"
3. Busca/selecciona paciente
4. (Opcional) Selecciona tratamiento → pre-llena saldo
5. Ingresa monto, método, concepto
6. Paciente firma en pantalla
7. Confirma pago
8. Sistema: crea pago, comprobante, actualiza tratamiento
9. Muestra comprobante para imprimir

---

## Configuración

### Server (.env)
```
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ventura_dental
DB_USER=postgres
DB_PASSWORD=
JWT_SECRET=tu-secret-key
JWT_EXPIRES_IN=8h
BUSINESS_NAME=Ventura Dental
BUSINESS_RUC=20XXXXXXXXX
```

### Client (vite.config.ts)
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

---

## Scripts de Backup

```bash
cd docs/BACKUPS
chmod +x backup.sh
./backup.sh all  # código + bd
./backup.sh code # solo código
./backup.sh db   # solo bd
```

---

## Errores Comunes

| Error | Solución |
|-------|---------|
| Connection terminated | Verificar PostgreSQL corriendo |
| Token inválido | Cerrar y volver a iniciar sesión |
| Tabla no existe | Ejecutar db:init |

---

## Uso del Sistema

### 1. Registrar Paciente
- Ir a Pacientes → + Nuevo Paciente → Datos → Guardar

### 2. Crear Tratamiento
- Ir a Tratamientos → + Nuevo Tratamiento → Seleccionar paciente → Tipo, monto, fecha → Guardar

### 3. Registrar Pago
- Ir a Nuevo Pago → Buscar paciente → (Opcional) Tratamiento → Monto, método, concepto → Firma → Registrar → Imprimir comprobante

### 4. Ver Estadísticas
- Ir a Dashboard → Total pagos, monto cobrado, promedio, desglose por método

---

Documentación adicional: docs/ARQUITECTURA.md | docs/API.md | docs/MANUAL.md