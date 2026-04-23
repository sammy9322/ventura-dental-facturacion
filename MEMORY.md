# MEMORIA DE PROYECTO (Ventura Dental)

## Estado Actual
*   **Fase Activa:** Fase 3 (Cierre de Caja).
*   **Fases Completadas:** Fase 1 (Diseño Premium UI) y Fase 2 (Módulo de Auditoría).

## Arquitectura y Tecnologías
*   **Frontend:** React con Vite (client/).
*   **Backend:** Express (server/).
*   **Estilos:** Basados en variables CSS nativas (:root) inyectadas globalmente en mejoras.css e index.css. Sistema de cambio de temas (ThemeContext).

## Ubicación Clave de Archivos
*   App.tsx: Define el enrutamiento y las reglas de seguridad basadas en roles (RoleRoute).
*   MainLayout.tsx: Contenedor principal que inyecta el Sidebar en todas las pantallas.
*   AuditoriaPage.tsx: Interfaz para ver transacciones seguras (solo Admin).

## Tareas Pendientes (Next Steps)
1.  Implementar la lógica del Cierre de Caja en el Frontend.
2.  Desarrollar el endpoint de consolidación diaria en el Backend.
3.  Verificar que los roles sigan funcionando tras la integración del cierre.

> **Nota para IA:** Este proyecto fue migrado desde una carpeta problemática en OneDrive a un entorno seguro en el disco E:. La estructura actual es la única fuente de la verdad.
