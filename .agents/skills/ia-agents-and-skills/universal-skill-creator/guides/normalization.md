# Guía de Auditoría y Normalización de Skills

Esta guía te ayuda a identificar skills existentes que no siguen el estándar y normalizarlos para garantizar consistencia y compatibilidad con todos los agentes.

## 1. Identificación de Skills "Legacy"

Un skill se considera "Legacy" o "No Estándar" si cumple alguna de estas condiciones:

- ❌ No tiene archivo `SKILL.md` (instrucciones en README u otro formato).
- ❌ Falta YAML Frontmatter (metadata al inicio del archivo).
- ❌ No incluye los campos obligatorios `name` y `description`.
- ❌ Estructura de carpetas plana (todo en la raíz del skill).
- ❌ Falta sección "When to Use / Cuándo Usar".
- ❌ No define triggers claros.

## 2. Proceso de Auditoría Automática

Pudes usar el script de validación para auditar un skill existente:

```bash
./skills/universal-skill-creator/scripts/validate_skill.sh skills/{nombre-skill-legacy}
```

El script reportará errores (`✗`) y advertencias (`⚠`). Tu objetivo es eliminar todos los errores.

## 3. Pasos de Normalización

Para normalizar un skill, sigue este flujo:

### Paso A: Estructurar Carpetas

Si el skill es un solo archivo o una mezcla de archivos:

1. Crea carpeta `skills/{nombre}/`
2. Mueve documentación principal a `skills/{nombre}/SKILL.md`
3. Mueve scripts a `skills/{nombre}/scripts/`
4. Mueve ejemplos a `skills/{nombre}/assets/examples/`

### Paso B: Agregar Frontmatter

Agrega el bloque YAML al inicio de `SKILL.md`:

```yaml
---
name: {nombre-kebab-case}
description: >
  {descripción corta}
  Trigger: {cuándo activar este skill}
license: MIT
metadata:
  version: "1.0"
---
```

### Paso C: Estandarizar Secciones

Renombra y reordena las secciones para seguir el estándar:

1. **When to Use**: Clave para que el agente sepa cuándo usarlo.
2. **Critical Patterns**: Code snippets esenciales.
3. **AI Behavior**: Instrucciones explícitas para el agente.

### Paso D: Configurar Agentes

Una vez normalizado, asegúrate de que el skill esté registrado en `AGENTS.md` para que todos los asistentes (Claude, Gemini, Copilot) puedan encontrarlo.

## 4. Estrategia de Migración

Si tienes muchos skills legacy:

1. **Inventariar**: Lista todos los skills actuales.
2. **Priorizar**: Comienza por los más usados o críticos.
3. **Migrar**: Aplica los pasos A-C.
4. **Validar**: Ejecuta `validate_skill.sh`.
5. **Registrar**: Agrega a `AGENTS.md`.

## 5. Ejemplo de Refactorización

**Antes (Legacy):**
`skills/python-testing.md`
```markdown
# Guía de Testing en Python
Usa pytest siempre.
Ejemplo:
def test_foo(): assert True
```

**Después (Normalizado):**
`skills/python-testing/SKILL.md`
```markdown
---
name: python-testing
description: Estándares de testing con pytest. Trigger: Al crear tests en Python.
---
# Python Testing Skill

## When to Use
- Al crear nuevos tests unitarios
- Al refactorizar tests existentes

## Critical Patterns
...
```
