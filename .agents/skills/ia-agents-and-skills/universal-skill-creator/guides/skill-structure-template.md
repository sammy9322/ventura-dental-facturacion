# Estructura de Referencia para SKILL.md

Todo skill DEBE seguir este formato mínimo en su archivo `SKILL.md`.

```markdown
---
```markdown
---
name: {skill-name}
# ⚠️ IMPORTANTE: 'name' DEBE ser kebab-case (ej. my-skill), minúsculas, sin espacios.
# Máximo 64 caracteres. Requerido estrictamente por GitHub Copilot.
description: >
  {Qué hace este skill en 1-2 líneas}.
  Trigger: {Cuándo debe activarse - SÉ ESPECÍFICO}.
  # NOTA: El trigger va DENTRO de la descripción para que funcionen los embeddings.
license: MIT
metadata:
  version: "1.0"
---

# {Skill Name}

## When to Use / Cuándo Usar
- {Condición de activación 1}
- {Condición de activación 2}

## Critical Patterns / Patrones Críticos
{Las reglas MÁS importantes - lo que el agente DEBE saber}

### Patrón 1: {Nombre}
\`\`\`{lenguaje}
{código de ejemplo}
\`\`\`

## Code Examples / Ejemplos de Código

### ❌ Incorrecto
\`\`\`{lenguaje}
{antipatrón}
\`\`\`

### ✅ Correcto
\`\`\`{lenguaje}
{patrón correcto}
\`\`\`

## AI Behavior / Comportamiento del Agente
1. {Instrucción de comportamiento 1}
2. {Instrucción de comportamiento 2}
```

## Convenciones de Nombrado

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Tecnología | `{tecnología}` | `react`, `python` |
| Proyecto | `{proyecto}-{módulo}` | `api-auth`, `web-ui` |
| Acción | `{verb}-{noun}` | `create-skill`, `audit-code` |
