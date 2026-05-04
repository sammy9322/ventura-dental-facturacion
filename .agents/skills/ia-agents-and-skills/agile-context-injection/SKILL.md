---
name: agile-context-injection
description: >
  Skill diseñado para inyectar contexto y hacer el 'onboarding' inicial de agentes ágiles en un proyecto nuevo.
  Guía al usuario paso a paso para recopilar la información necesaria de Azure DevOps y la arquitectura del sistema.
  Trigger: 'iniciar contexto agil', 'configurar azure devops', 'onboarding de proyecto', 'setup project context'.
license: MIT
metadata:
  author: mapplics
  version: "1.0"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, MCP
---

# Agile Context Injection

Skill especializado en el descubrimiento y configuración del contexto necesario para que los agentes ágiles (como `agile-product-owner`) puedan operar en un proyecto específico.

## When to Use This Skill

Usa este skill cuando:
- Ingresas a un nuevo repositorio o entorno de trabajo y necesitas configurar las integraciones ágiles.
- El usuario solicita preparar el entorno para la planificación ágil.
- Faltan datos críticos como el nombre de la organización, el proyecto de Azure DevOps, o los Area Paths.

## Comportamiento del Agente (Proceso de Onboarding)

El onboarding consta de 3 pasos que DEBES seguir secuencialmente:

### Paso 1: Autodescubrimiento (Investigación Automática)

Antes de molestar al usuario, intenta descubrir la mayor cantidad de información posible por ti mismo.

1.  **Analizar el Repositorio Local**:
    - Busca archivos como `package.json`, `composer.json`, `.git/config` o READMEs que puedan revelar el nombre del proyecto o la organización.
2.  **Consultar Azure DevOps via MCP**:
    - Ejecuta `mcp__microsoft_azu__core_list_projects` para ver si puedes inferir el proyecto correcto basado en el nombre del repositorio o el contexto local.
    - Si identificas un proyecto probable, ejecuta `mcp__microsoft_azu__core_list_project_teams` para ver los equipos.
    - Muestra al usuario tus hallazgos pre-llenados en el cuestionario.

### Paso 2: Cuestionario Interactivo (Llenar los huecos)

Presenta al usuario un resumen de lo que encontraste y hazle preguntas concretas para completar la información faltante. Explícale *por qué* necesitas esta información.

**Ejemplo de Cuestionario:**
"He analizado el entorno y necesito confirmar los siguientes datos para configurar nuestro espacio de trabajo ágil:"
1.  **Organización de Azure DevOps**: (Ej. mapplicsdevs) [Encontrado/Deducido: X]
2.  **Proyecto de Azure DevOps**: (Ej. MEN0009-Shell) [Encontrado/Deducido: Y]
3.  **Area Paths Principales**: (¿Cómo se dividen los equipos/módulos en Azure DevOps?)
4.  **Iteration Paths (Sprints)**: (¿Cuál es la convención de nombres para los sprints?)
5.  **Mapeo de Repositorios a Area Paths**: (¿Qué repositorios locales corresponden a qué Area Paths en ADO?)

*Nota: Pide al usuario que copie y pegue la URL de un work item existente si no sabe los nombres exactos; tú puedes deducir el resto a partir de esa URL.*

### Paso 3: Generación de Skill de Arquitectura (Persistencia)

Una vez que tengas toda la información validada, debes persistirla para que otros agentes (como `agile-product-owner`) puedan usarla sin preguntar de nuevo.

Usa el framework de skills (o recomienda usar `universal-skill-creator`) para generar un nuevo skill específico del proyecto.

**Archivo a Generar:** `skills/{nombre-proyecto}-architecture/SKILL.md`

Este skill generado debe contener:
- Los IDs y URLs de Azure DevOps.
- El mapeo de repositorios a Area Paths.
- Reglas específicas del proyecto (ej. convenciones de nombrado de ramas, si aplican).

*Si el usuario no tiene los scripts de creación de skills, usa las herramientas del sistema (ej. `mkdir` y edición de archivos) para crear la carpeta y el `SKILL.md` directamente.*

## Artifacts Generados

Al final de este proceso, debes haber creado o actualizado un documento (preferiblemente un nuevo skill como `[project]-architecture`) que otro agente pueda leer para obtener el contexto completo.

## Ejemplo de Configuración Generada (Para incluir en el nuevo skill)

```yaml
# Esta información debe inyectarse en el skill generado
azure_devops:
  organization: "<ORG_NAME>"
  project: "<PROJECT_NAME>"
  project_id: "<PROJECT_ID>"
area_paths:
  frontend: "<PROJECT_NAME>\\Frontend"
  backend: "<PROJECT_NAME>\\Backend"
```
