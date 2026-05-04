---
name: [project_name]-architecture
description: >
  Skill autogenerado por agile-context-injection. 
  Contiene el contexto específico del proyecto (Azure DevOps, Area Paths, Mapeos).
license: MIT
metadata:
  version: "1.0"
  type: context
---

# [Project Name] Architecture & Context

Este skill provee el contexto necesario para que los agentes generales puedan operar dentro de las especificidades de este proyecto.

## Azure DevOps Configuration

| Campo | Valor |
|-------|-------|
| Organización | `<ORG_NAME>` |
| Proyecto | `<PROJECT_NAME>` |
| ID del Proyecto | `<PROJECT_ID>` |

## Area Paths & Repositories Mapping

| Repositorio / Módulo | Area Path en Azure DevOps |
|----------------------|---------------------------|
| `<repo_name_1>`      | `<ORG_NAME>\<PROJECT_NAME>\Area1` |
| `<repo_name_2>`      | `<ORG_NAME>\<PROJECT_NAME>\Area2` |

## Iteration Paths (Sprints)

Convención de nombres: `<ORG_NAME>\<PROJECT_NAME>\Sprint <número>`
Ejemplo: `MapplicsDevs\MyProject\Sprint 12`

## Consideraciones Generales del Proyecto

[Añadir aquí cualquier regla específica o arquitectura de alto nivel descubierta durante la inyección de contexto]
