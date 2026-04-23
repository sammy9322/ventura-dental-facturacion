# MEMORIA DE PROYECTO (Ventura Dental)

## Estado Actual
*   **Fase Activa:** Fase 4 (Reportes y Exportación - Opcional) / Mantenimiento.
*   **Fases Completadas:** Fase 1 (Diseño Premium UI), Fase 2 (Módulo de Auditoría Real - Backend/DB) y Fase 3 (Cierre de Caja).
*   **Correcciones de UI:** Se implementó `cursor: pointer` en el sidebar y se unificó el diseño de Auditoría (Fase 2).


## Arquitectura y Tecnologías
*   **Frontend:** React con Vite (client/).
*   **Backend:** Express (server/).
*   **Base de Datos:** PostgreSQL (Neon).
*   **Seguridad:** Se migró de `bcrypt` a `bcryptjs` para compatibilidad universal entre entornos.
*   **Estilos:** Basados en variables CSS nativas (:root) inyectadas globalmente en mejoras.css e index.css. Sistema de cambio de temas (ThemeContext).

## Ubicación Clave de Archivos
*   App.tsx: Define el enrutamiento y las reglas de seguridad basadas en roles (RoleRoute).
*   MainLayout.tsx: Contenedor principal que inyecta el Sidebar en todas las pantallas.
*   AuditoriaPage.tsx: Interfaz para ver transacciones seguras (solo Admin).
*   CierreCajaPage.tsx: Módulo de conciliación diaria de caja.

## Tareas Pendientes (Next Steps)
1.  Verificar el flujo de cierre con transacciones reales en el consultorio.
2.  Considerar la exportación de comprobantes a PDF si el cliente lo requiere.
3.  Optimizar la carga de historial de cierres con paginación si crece demasiado.

> **Nota para IA:** Este proyecto fue migrado desde una carpeta problemática en OneDrive a un entorno seguro en el disco E:. La estructura actual es la única fuente de la verdad.

## Lecciones Aprendidas (Troubleshooting & Eficiencia)
*   **Vercel Build Errors ("File name too long"):** Este error en Vercel casi siempre se debe a archivos `.zip` anidados, enlaces simbólicos (`symlinks`) o archivos basura de macOS (`._*`) en el historial de Git. **Regla estricta:** NUNCA hacer commit de la carpeta `docs/BACKUPS/` ni archivos generados automáticamente.
*   **Refactorización de UI:** Al unificar Layouts, es imperativo hacer un `grep_search` preventivo en los archivos CSS (`index.css`, `mejoras.css`) para asegurar que el nombre exacto de la clase (`.layout` vs `.app-layout`) coincida antes de hacer push. Un error de tipografía en CSS destruye la cuadrícula (grid/flex).
*   **Eficiencia de Tokens y Ejecución:** Reducir la dependencia del método ensayo/error. Antes de aplicar cambios masivos, se debe verificar el estado real del repositorio y analizar el impacto cruzado, agrupando los comandos para ahorrar tokens y tiempo de procesamiento.
