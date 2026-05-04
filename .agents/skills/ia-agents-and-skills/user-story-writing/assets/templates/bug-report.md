---
localId: "BUG-XXX"
adoId:
type: "Bug"
title: "[BUG][Module] Concise problem description"
parentLocalId: "US-XXX"   # or FEATURE-XXX
parentAdoId:
status: draft
severity:                 # "1 - Critical" | "2 - High" | "3 - Medium" | "4 - Low"
area:
areaPath: "MEN0009-Shell.SCM_1\\..."
iterationPath:
priority: 2
assignedTo:
tags: []
createdDate:              # YYYY-MM-DD
lastModified:             # YYYY-MM-DD
---

# Comportamiento Actual

<!-- Que esta pasando actualmente (el bug) -->

## Comportamiento Esperado

<!-- Que deberia pasar segun el diseno/requerimiento -->

## Impacto

<!-- Como afecta a los usuarios o al negocio -->

## Pasos para Reproducir

1. Navegar a `[URL o ruta]`
2. Iniciar sesion como `[rol de usuario]`
3. Realizar `[accion especifica]`
4. Observar `[resultado incorrecto]`

**Frecuencia de reproduccion**: [Siempre / Intermitente / Raro]

## Evidencia

### Logs de Error

```
[Pegar logs relevantes aqui]
```

### Request/Response (si aplica)

```json
// Request
{
  "endpoint": "POST /api/v1/...",
  "body": {}
}

// Response
{
  "status": 500,
  "error": "..."
}
```

## Analisis Preliminar

### Causa Probable

<!-- Hipotesis sobre la causa del bug -->

### Archivos Afectados

- `path/to/file1`
- `path/to/file2`

### Solucion Propuesta

<!-- Enfoque sugerido para la correccion -->

## Criterios de Aceptacion del Fix

```gherkin
Given el bug ha sido corregido
When [escenario que antes fallaba]
Then [comportamiento correcto esperado]
And no hay regresiones en [funcionalidad relacionada]
```
