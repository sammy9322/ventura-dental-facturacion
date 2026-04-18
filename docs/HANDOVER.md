# Documento de Traspaso (Handover) - Ventura Dental
## Sistema de Facturación y Gestión Clínica

Este documento está diseñado para que un nuevo desarrollador o un asistente de IA pueda retomar el proyecto instantáneamente sin pérdida de contexto.

---

## 🚀 Estado del Proyecto (Abril 2026)

El sistema ha pasado por una fase de rediseño para soportar una operativa de clínica moderna (**Dual Flow**). Se encuentra estable y en uso para la gestión de pacientes, tratamientos y flujo de caja en múltiples monedas.

### Logros Clave:
- **Flujo de Pago en 2 Pasos:** Los doctores registran la actividad clínica y las secretarias procesan el cobro físico.
- **Catálogo Inteligente:** Rediseño de Procesos y Procedimientos con IU de panel dividido.
- **Integridad Financiera:** Bloqueo de moneda CRC en presupuestos para evitar devaluación de saldos históricos.
- **Comprobantes Automáticos:** Generación de correlativos por año (Ej: 2026-0001).

---

## 🏗️ Guía Técnica para Desarrolladores (IA & Humanos)

### 1. Patrones de Código Mandatorios
- **Transaccionalidad Directa:** No usamos ORM (Prisma). Usamos el driver `pg` directamente para tener control total sobre las transacciones.
- **Race Conditions:** Al tocar saldos o secuencias, siempre usar `SELECT ... FOR UPDATE` dentro de la transacción. Ver ejemplo en `server/src/models/pago.ts`.
- **Nomenclatura:** 
    - UI: **Proceso Clínico** y **Procedimiento Clínico**.
    - DB: `tratamientos_macro` y `tratamientos_micro`.
- **CSS:** Vanilla CSS. Todas las variables están en `client/src/styles/index.css`. No introducir Tailwind sin aprobación.

### 2. Mapa de Navegación Rápida
- **Core de Cobros:** `server/src/models/pago.ts` (Métodos `create` y `finalizar`).
- **Esquema de BD:** `server/src/scripts/initDb.ts` (Contiene todos los `CREATE TABLE` y migraciones).
- **Tipos Globales:** `client/src/types/index.ts` (Fuente de verdad para interfaces TS).
- **Servicios API:** `client/src/services/` (Divididos por módulo).

---

## 🗺️ Roadmap de Mejora (Pendientes)

Si se desea continuar el desarrollo, estos son los puntos priorizados:

1.  **Auditoría Extendida:** Implementar un middleware que registre cada acción destructiva (anulaciones, ediciones de precios) en una tabla `logs_auditoria`.
2.  **Reportes PDF Físicos:** Actualmente se usa `window.print()`. Se recomienda integrar `jspdf` o un servicio de backend para generar PDFs estandarizados.
3.  **Backups Automatizados:** El script `docs/BACKUPS/backup.sh` es manual. Debería programarse vía `cron`.
4.  **Validación de Caja:** Un módulo para "Cierre de Caja" diario que compare el total del sistema vs el dinero físico contado por la secretaria.

---

## 🆘 Troubleshooting

- **"El monto pagado no se actualiza":** Verificar que el ítem en `detalle_pago` tenga `es_cuota_principal: true`. Sin este flag, el monto se registra pero no afecta el saldo del tratamiento maestro.
- **"Error en secuencia de comprobante":** Si se resetea la BD, asegurarse de que `sequence_comprobantes` tenga el registro del año actual o falle el primer `INSERT`.

---
**Contacto Técnico:** Equipo de Desarrollo Ventura Dental / Lab.
