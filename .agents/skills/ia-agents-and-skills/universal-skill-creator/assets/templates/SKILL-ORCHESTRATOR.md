---
name: {dominio}-orchestrator
description: >
  Orchestrates {dominio} skills based on task context.
  Trigger: {Cuándo activarse para coordinar otros skills}.
license: MIT
metadata:
  author: {tu-nombre}
  version: "1.0"
  type: orchestrator
---

# {Dominio} Orchestrator

> "{Cita o principio guía del dominio}"
> — {Fuente si aplica}

Este skill **no implementa reglas directamente**, sino que **coordina** 
otros skills especializados según el contexto de la tarea.

---

## Cuándo Usar

Activa este skill cuando:
- Trabajes en cualquier tarea de {dominio}
- Necesites aplicar múltiples patrones relacionados
- No esté claro qué skill específico usar

**Este skill actúa como punto de entrada** y delega a skills más específicos.

---

## Filosofía del Orquestador

{Descripción del principio guía - ej: "Boy Scout Rule", "Clean Code", etc.}

- {Principio 1}
- {Principio 2}
- {Principio 3}

---

## Skills Coordinados

### Catálogo de Skills

| Skill | Propósito | Trigger |
|-------|-----------|---------|
| `{skill-1}` | {Qué hace} | {Cuándo invocarlo} |
| `{skill-2}` | {Qué hace} | {Cuándo invocarlo} |
| `{skill-3}` | {Qué hace} | {Cuándo invocarlo} |
| `{skill-4}` | {Qué hace} | {Cuándo invocarlo} |
| `{skill-master}` | Reglas completas | Para revisión exhaustiva |

### Matriz de Delegación

```
Tarea del Usuario                    → Skill a Invocar
────────────────────────────────────────────────────────
Crear/modificar {cosa-1}             → {skill-1}
Revisar/refactorizar {cosa-2}        → {skill-2}
Escribir/revisar {cosa-3}            → {skill-3}
{Tarea general de dominio}           → {skill-master}
```

---

## Lógica de Orquestación

### Flujo Principal

```
1. Recibir tarea del usuario
   │
2. Identificar tipo de tarea
   │
3. ¿Se puede resolver sin skill específico?
   ├── SÍ → Aplicar mejora mínima (Quick Wins)
   └── NO → Delegar a skill apropiado
   │
4. Completar tarea principal
   │
5. Buscar mejoras adicionales (Boy Scout)
   │
6. Reportar acciones realizadas
```

### Árbol de Delegación

```
¿Qué tipo de tarea es?
│
├── {Tipo A}
│   └── Delegar a: {skill-a}
│
├── {Tipo B}
│   └── Delegar a: {skill-b}
│
├── {Tipo C}
│   └── Delegar a: {skill-c}
│
├── Revisión completa
│   └── Delegar a: {skill-master}
│
└── No está claro
    └── Preguntar al usuario o usar heurísticas
```

---

## Quick Wins (Acciones Inmediatas)

Mejoras que el orquestador puede aplicar **directamente** sin delegar:

### Hacer Inmediatamente

- {Mejora rápida 1 - ej: renombrar variable mal nombrada}
- {Mejora rápida 2 - ej: eliminar código muerto}
- {Mejora rápida 3 - ej: reemplazar magic number}
- {Mejora rápida 4 - ej: eliminar import no usado}

### Delegar (Requiere Skill Especializado)

- {Tarea compleja 1} → `{skill-x}`
- {Tarea compleja 2} → `{skill-y}`
- {Tarea compleja 3} → `{skill-z}`

---

## Ejemplo de Orquestación

### Escenario

El usuario pide: *"{Solicitud de ejemplo}"*

### Flujo del Orquestador

```markdown
1. **Análisis inicial**: La tarea implica {acción}
2. **Skill identificado**: Cargar `{skill-apropiado}`
3. **Ejecución**: Seguir instrucciones del skill
4. **Quick wins encontrados**:
   - Renombré `{var_mala}` → `{var_buena}`
   - Eliminé {cosa innecesaria}
5. **Reporte**: "Tarea completada. Además, mejoré: {lista}"
```

---

## Comportamiento del Agente

### Mentalidad

**HACER:**
- {Comportamiento positivo 1}
- {Comportamiento positivo 2}
- {Comportamiento positivo 3}
- Siempre buscar al menos una mejora adicional

**NO HACER:**
- {Comportamiento a evitar 1}
- {Comportamiento a evitar 2}
- Hacer cambios masivos no relacionados con la tarea

### Protocolo de Orquestación

1. **Completar la tarea solicitada PRIMERO**
2. Identificar oportunidades de mejora
3. Aplicar mejoras proporcionales a la tarea
4. Documentar las mejoras realizadas
5. Sugerir (no ejecutar) mejoras mayores si las hay

### Formato de Reporte

```markdown
✅ **Tarea completada**: {descripción breve}

🔧 **Mejoras aplicadas** (proporcionales):
- {Mejora 1}: {detalle breve}
- {Mejora 2}: {detalle breve}

💡 **Sugerencias para el futuro**:
- {Sugerencia mayor si aplica}
```

---

## Interacción con Otros Skills

Cuando cargues un skill delegado:

1. **Leer el skill completo**: `view_file("skills/{skill}/SKILL.md")`
2. **Seguir sus instrucciones**: El skill delegado toma control temporal
3. **Volver al orquestador**: Para reportar y buscar más mejoras
4. **No mezclar reglas**: Cada skill tiene su dominio

---

## Recursos

- **Skills coordinados**: Ver listado en sección "Skills Coordinados"
- **Skill maestro**: `{skill-master}` para reglas completas
- **Documentación del dominio**: [{nombre}]({url o ruta local})

---

## El Compromiso del Orquestador

> {Frase de compromiso o principio final}
> Cada vez que tocas código de {dominio}, mejóralo un poco.
> No perfecto, solo mejor.
