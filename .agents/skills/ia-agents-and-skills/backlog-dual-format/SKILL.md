---
name: backlog-dual-format
description: >
  Sistema dual-format para gestion de backlog. Genera y mantiene sincronizados
  archivos Markdown (para revision humana) y JSON (para sincronizacion con sistemas como Azure DevOps/Jira).
  Triggers: backlog, dual format, generar historias, escribir markdown, sincronizar json.
license: MIT
metadata:
  version: "3.0"
  type: method
  author: mapplics
allowed-tools: Read, Edit, Write, Glob, Grep
---

# Backlog Dual-Format Management

Skill que define el sistema dual-format para generar, organizar y mantener sincronizados los work items en dos representaciones:
1.  **Markdown**: Para revisión, edición y lectura humana.
2.  **JSON**: Para sincronización automatizada (via scripts o llamadas MCP a herramientas externas).

## When to Use This Skill

Use this skill when you need to:
- Generar backlog items (epics, features, user stories, tasks, bugs) en formato Markdown
- Organizar work items en la jerarquía de carpetas del repositorio
- Convertir entre formatos MD y JSON
- Validar la sincronización MD <-> JSON
- Preparar archivos JSON para la integración
- Actualizar archivos MD tras la sincronización con un sistema externo

## Prerequisites

- Conocimiento del skill `user-story-writing` (para el uso de plantillas MD)
- Opcionalmente, configuración de un skill como `azure-devops-integration` u otro sistema de ticketing.

---

## Folder Structure Convention

La estructura de carpetas del backlog debe residir preferiblemente en la raíz o en una carpeta definida por la arquitectura (`backlog/`):

```
backlog/
|-- _index.md                          # Master index of all active backlog
|-- schema/                            # JSON schemas para validación
|-- epics/
|   +-- EPIC-XXX_slug/
|       |-- README.md                  # Epic description (from epic.md template)
|       +-- features/
|           +-- FEATURE-XXX_slug/
|               |-- README.md          # Feature description (from feature.md template)
|               |-- stories/
|               |   |-- US-XXX_slug.md # User Story (from user-story.md template)
|               |   +-- tasks/
|               |       +-- TASK-XXXX_slug.md  # Task (from task.md template)
|               +-- bugs/
|                   +-- BUG-XXX_slug.md        # Bug (from bug-report.md template)
|-- sync/
|   |-- drafts/                        # JSON backlog files in draft (esperando sync)
|   |-- approved/                      # Approved by human, ready for sync
|   |-- synced/                        # Synced with external system
|   +-- archive/                       # Historical
+-- archive/                           # Legacy files
```

### Naming Convention Rules

| Element | Pattern | Example |
|---------|---------|---------|
| Epic folder | `EPIC-{NUMBER}_{slug}` | `EPIC-001_optimizacion-inventario` |
| Feature folder | `FEATURE-{NUMBER}_{slug}` | `FEATURE-010_cache-redis` |
| Epic/Feature description | `README.md` inside their folder | `EPIC-001_optimizacion-inventario/README.md` |
| User Story file | `US-{NUMBER}_{slug}.md` | `US-101_consulta-rapida.md` |
| Task file | `TASK-{NUMBER}_{slug}.md` | `TASK-1001_agregar-indice.md` |
| Bug file | `BUG-{NUMBER}_{slug}.md` | `BUG-050_timeout.md` |
| JSON backlog file | `{YYYY-MM-DD}_{slug}.backlog.json` | `2026-02-26_sprint-65.backlog.json` |

**Slug rules:** Lowercase only, separated by hyphens (`-`), max 40 chars, no special characters.

## Required Frontmatter in Markdown

Cada archivo MD generado DEBE poseer un Frontmatter YAML que servirá de fuente de verdad para la generación del JSON.

```yaml
---
localId: "US-101"
type: "User Story"
title: "Título descriptivo del work item"
status: "draft"
parentLocalId: "FEATURE-010"
parentExternalId: null    # (O parentAdoId si se usa ADO)
externalId: null          # ID en el sistema externo una vez sincronizado
priority: 2
tags: ["etiqueta1", "etiqueta2"]
storyPoints: 5            # Sólo US
effort: null              # Sólo Epic/Feature
iterationPath: null
areaPath: null
createdDate: "YYYY-MM-DD"
lastModified: "YYYY-MM-DD"
---
```

## Workflows

### 1. MD Generation
1. Determina el parent (Epic/Feature). Si no existen las carpetas, créalas junto con sus `README.md`.
2. Asigna un `localId` único (buscando en el directorio actual el número más alto y sumándole 1).
3. Genera el archivo usando la plantilla de `user-story-writing`. Escribe Título, YAML y Cuerpo.
4. Actualiza `backlog/_index.md` con las nuevas entradas.
5. Pídele al usuario que revise.

### 2. JSON Generation
1. Parsea el frontmatter YAML de todos los MD involucrados en este batch (el sprint o epic seleccionado).
2. Construye el JSON array. Asegúrate de incluir la ruta `markdownPath` relativa desde el root de cada ítem.
3. Si un parent ya posee un `externalId`, insértalo como `parentExternalId` en el hijo.
4. Guarda el objeto final en `backlog/sync/drafts/{YYYY-MM-DD}_{slug}.backlog.json`.

### 3. Sincronización Post-Sync (Agent Action)
Cuando un agente termine de inyectar estos JSON en el sistema externo (ej. ADO o Jira) y consiga los IDs externos reales:
1. Abre cada archivo referenciado en el `markdownPath`.
2. Actualiza `externalId` (o `adoId`) con el nuevo ID.
3. Actualiza `status` a `synced`.
4. Mueve el JSON histórico a `backlog/sync/synced/` (si no existía la carpeta, créala).
5. Actualiza `_index.md`.

## AI Behavior Constraints

- ❌ NUNCA generar el JSON antes de que el humano haya revisado (y aprobado) los archivos Markdown si se requiere revisión.
- ❌ El campo `externalId` siempre queda nulo hasta completar el ciclo de sincronización; no te lo inventes.
- ✅ Al leer un backlog, primero actualízate leyendo `backlog/_index.md` para conocer el State of the World.
