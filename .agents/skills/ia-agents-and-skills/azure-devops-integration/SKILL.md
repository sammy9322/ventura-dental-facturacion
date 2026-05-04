---
name: azure-devops-integration
description: >
  Skill para integración con sistemas de gestión de tareas (Azure DevOps, Jira, etc.) usando MCP.
  Úsalo cuando necesites crear work items (Epic, Feature, User Story, Task, Bug),
  vincular elementos, asignar sprints, gestionar backlogs, o sincronizar.
  Triggers: crear epic, crear feature, crear tarea, vincular, sprint, backlog, Azure DevOps, Jira, sincronizar.
license: MIT
metadata:
  version: "4.0"
  type: script
  author: mapplics
allowed-tools: Read, Edit, Write, Glob, Grep, MCP
---

# Project Management System Integration (e.g., Azure DevOps)

Skill para la integración estandarizada entre el backlog local (`backlog-dual-format`) y un sistema de project management externo, como Azure DevOps o Jira, preferentemente a través de Model Context Protocol (MCP).

## When to Use This Skill

Usa este skill cuando necesites:
- Buscar Epics, Features, o US existentes en el sistema para vincular historias.
- Traducir y sincronizar historias de Markdown hacia el sistema externo.
- Desplegar una US a nivel técnico, creando `Task` y `Bug` ítems asociados bajo la User Story.
- Consultar las Iteraciones (Sprints) activas e históricas para estimar cuándo se completará un trabajo.

## Context Injection Required

A diferencia de un proyecto cerrado, esta skill es abstracta. Necesitas solicitar al usuario, o buscar en el `architecture-skill.md` generado en el Onboarding, la siguiente información antes de interactuar:

1. **Organización / Workspace:** Ej. `mapplicsdevs`
2. **Proyecto / Board:** Ej. `MiProyecto-Backend`
3. **Nombre del Equipo:** Ej. `Equipo Backend Ninja`
4. **Campos Custom (Custom Fields):** ¿Tiene este proyecto campos personalizados obligatorios que deban llenarse al crear User Stories?

## Azure DevOps MCP Cheat-Sheet

Si el usuario utiliza Azure DevOps y tú cuentas con un servidor MCP configurado (como `azure-devops-mcp`), estas son las herramientas preferidas y cómo llamarlas. Reemplaza `<org>` y `<project>` con la información contextual:

### Búsqueda de Work Items
Para buscar un work item padre para vincular (mcp_azure-devops-mcp_wit_get_query_results_by_id o search):
Usa `search_workitem` con `searchText`.

### Creación de Work Items en ADO
Usa `mcp_azure-devops-mcp_wit_create_work_item`.
**Parámetros Típicos:**
- `project`: `<NOMBRE_PROYECTO>`
- `workItemType`: "Epic", "Feature", "User Story", "Task", o "Bug"  (Consulta primero si hay tipos custom).
- `fields`: Un array de `{name: "System.XXX", value: "..."}`

```json
{
  "project": "MiProyecto",
  "workItemType": "Task",
  "fields": [
    { "name": "System.Title", "value": "Implementar backend route" },
    { "name": "System.Description", "value": "Descripción detallada" }
  ]
}
```

**Lista de Campos Estándar de ADO:**
*   `System.Title`: Título del ítem.
*   `System.Description`: Descripción enriquecida (Usa la descripción en HTML/Markdown que creaste).
*   `Microsoft.VSTS.Common.AcceptanceCriteria`: (Solo para US) Criterios de aceptación (Gherkin/Checklist).
*   `Microsoft.VSTS.Scheduling.StoryPoints`: Esfuerzo relativo.
*   `System.Tags`: Etiquetas. Lista sep. por punto y coma ("Tag1; Tag2").
*   `System.AreaPath`: Ruta de área (ej. `ProjectName\AreaX\AreaY`).
*   `System.IterationPath`: Sprint al que pertenece el ítem (ej. `ProjectName\Sprint 01`).
*   `System.AssignedTo`: Asignar a un email/username particular si es requerido.

### Vinculación (Linking)
Usa `mcp_azure-devops-mcp_wit_work_items_link`.
**Parámetros:**
- `updates` array con objetos `{ id: hijo, linkToId: padre, type: "parent" / "child" / "related" }`

### Asignar a Sprints
Para averiguar los IDs/Path de la iteración en curso:
- `mcp_azure-devops-mcp_work_list_iterations` o
- `mcp_azure-devops-mcp_work_list_team_iterations`

## Flujo de Sincronización

1.  Genera el `backlog.json` desde tus Markdown (ver `backlog-dual-format`).
2.  Lee el JSON.
3.  Obtén contexto (Organización, Proyecto, Iteration Path) de las definiciones.
4.  Crea ítems en orden jerárquico (Epic -> Feature -> Story -> Task).
5.  A cada creación de ADO, recoge el ID obtenido y viértelo en el Frontmatter YAML local del Markdown como `externalId:` / `adoId:`.
6.  Actualiza los hijos a medida que descubres el ID del padre recién creado.

## Post-Sync Protocol

- NO te olvides de llamar a `multi_replace_file_content` para insertar los nuevos `parentExternalId` y `externalId` en los Markdown locales tras haberlos metido en ADO.
- Si no haces esto, se generarán duplicados en el próximo sync.

## Comportamiento del Agente

1. **Prioridad MCP**: Si el usuario te indica sincronizar historias, utiliza las herramientas MCP listadas antes que scripts locales o curl.
2. **Validación de Datos**: Antes de crear un item en el external tracker, verifica que tienes asignados todos los campos obligatorios leyendo el `architecture-skill.md`.
