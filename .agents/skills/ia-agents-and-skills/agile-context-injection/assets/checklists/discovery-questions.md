# System Architecture & Context Discovery Questions

Este checklist debe ser utilizado por el agente durante la Fase 1 del "Context Injection" para extraer información clave del usuario sobre un proyecto nuevo, en caso de que el auto-descubrimiento (MCP) sea insuficiente.

## 🏢 Organización y Proyecto

1. ¿Cuál es la URL base o nombre de la Organización en Azure DevOps (o Jira)?
2. ¿Cuál es el nombre exacto del Proyecto (Project Name) donde se gestionará el Backlog?
3. (Opcional) ¿Conoces el Project ID exacto (GUID)?

## 🗃️ Estructura de Trabajo (Áreas e Iteraciones)

4. ¿Tienen configurada una jerarquía de Area Paths? ¿Podrías listar los equipos principales o áreas de dominio? (Ej: `App/Frontend`, `App/Backend`, `Corporate/Billing`)
5. ¿Cómo están estructuradas las Iteraciones/Sprints? ¿Cuál es el Path o convención de nombres? (Ej: `ProjectName/PI 1/Sprint 1` o `ProjectName/Release 1.0/Sprint 12`)
6. ¿Dónde prefiere el equipo que se planifiquen las historias por defecto (Iteration Path por defecto)?

## 💻 Repositorios y Código Fuente

7. ¿Qué repositorios de Git están asociados a este Backlog?
8. ¿Hay alguna convención específica de nombres para las ramas (branching strategy)? (Ej: `feature/<task-id>-<description>`)
9. ¿Existen componentes técnicos separados que debamos documentar como "Dominios" distintos en el archivo de arquitectura? (Ej: Una API en Node, un WebApp en React, una DB en Postgres)

## 👥 Personas y Roles

10. Roles de Usuario: ¿Quiénes utilizan el sistema? (Identificar los "As a [role]" típicos para la redacción de US).
11. ¿Cuáles son las cuentas de correo o alias del equipo (Tech Lead, Product Owner) en caso de que el agente necesite asignarles tareas o @mencionarlos?

## 📊 Varios

12. ¿Tienen alguna metodología preferida para estimar puntos de historia? (Ej: Fibonacci modificado, T-shirt sizing)
13. ¿Existe algún Definition of Done (DoD) genérico que deba aplicarse a todas las historias?
