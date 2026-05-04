---
# ⚠️ REGLAS DEL CAMPO 'name':
#   - Solo minúsculas, números y guiones (a-z, 0-9, -). Max 64 chars.
#   - NO puede contener: 'anthropic', 'claude', ni etiquetas XML.
#   - DEBE coincidir con el nombre del directorio padre.
name: {skill-name}
# ⚠️ REGLAS DEL CAMPO 'description':
#   - Siempre en TERCERA PERSONA (no "I can...", no "You can...").
#   - Incluir QUÉ hace + CUÁNDO usarlo (para que los agentes lo detecen correctamente).
#   - Max 1024 caracteres.
description: >
  {Descripción breve de qué habilita este skill - 1 línea. Tercera persona}.
  Trigger: {Cuándo debe activarse - sé específico con verbos de acción}.
license: MIT
metadata:
  author: {tu-nombre}
  version: "1.0"
---

# {Nombre del Skill}

> {Cita o principio guía opcional}

<!-- ⚠️ Límite de contenido: mantener este archivo ≤ 500 líneas.
     Material extenso (referencias, ejemplos completos, APIs) → referencias/ o guides/
     Usar progressive disclosure: incluir inline lo esencial, referenciar el resto. -->

## Cuándo Usar

Activa este skill cuando:
- {Condición de activación 1}
- {Condición de activación 2}
- {Condición de activación 3}

**No usar cuando:**
- {Excepción o caso donde no aplica}

---

## Patrones Críticos

{Las reglas MÁS importantes que el agente DEBE seguir}

### Patrón 1: {Nombre del Patrón}

**Descripción**: {Qué hace y por qué es importante}

```{lenguaje}
# Ejemplo de implementación correcta
{código de ejemplo}
```

### Patrón 2: {Nombre del Patrón}

**Descripción**: {Qué hace y por qué es importante}

```{lenguaje}
# Ejemplo de implementación correcta
{código de ejemplo}
```

---

## Árbol de Decisiones

```
{Pregunta de decisión 1}?
├── SÍ → {Acción A}
└── NO → {Pregunta 2}?
    ├── SÍ → {Acción B}
    └── NO → {Acción por defecto}
```

---

## Referencias

<!-- Usar esta sección para progressive disclosure.
     Listar aquí los archivos en references/ que Claude cargará bajo demanda.
     Mantener referencias a 1 solo nivel de profundidad desde este SKILL.md. -->

<!-- Descomentar y adaptar según necesidad:
**API Reference**: See [references/api-reference.md](references/api-reference.md)
**Ejemplos avanzados**: See [references/examples.md](references/examples.md)
**Guía detallada**: See [guides/guide.md](guides/guide.md)
-->

---

## Ejemplos de Código

### ❌ Antipatrón: {Nombre}

**Problema**: {Por qué esto es malo}

```{lenguaje}
# MAL - No hacer esto
{código incorrecto}
```

### ✅ Patrón Correcto: {Nombre}

**Solución**: {Por qué esto es mejor}

```{lenguaje}
# BIEN - Hacer esto
{código correcto}
```

---

## Comandos Comunes

```bash
# {Descripción del comando 1}
{comando 1}

# {Descripción del comando 2}
{comando 2}

# {Descripción del comando 3}
{comando 3}
```

---

## Tabla de Referencia Rápida

| Escenario | Acción | Ejemplo |
|-----------|--------|---------|
| {Escenario 1} | {Qué hacer} | `{ejemplo}` |
| {Escenario 2} | {Qué hacer} | `{ejemplo}` |
| {Escenario 3} | {Qué hacer} | `{ejemplo}` |

---

## Recursos

- **Documentación oficial**: [{Nombre}]({URL})
- **Ejemplos adicionales**: Ver [assets/examples/]({ruta}) si existe
- **Guías avanzadas**: Ver [guides/]({ruta}) si existe

---

## Comportamiento del Agente

Cuando trabajes con este skill:

1. **Primero**: {Primera acción que el agente debe tomar}
2. **Validar**: {Qué debe verificar antes de actuar}
3. **Aplicar**: {Cómo debe aplicar los patrones}
4. **Reportar**: {Qué información debe comunicar al usuario}

### Notas Importantes

- {Nota 1 sobre comportamiento especial}
- {Nota 2 sobre casos borde}
- {Nota 3 sobre integración con otros skills}
