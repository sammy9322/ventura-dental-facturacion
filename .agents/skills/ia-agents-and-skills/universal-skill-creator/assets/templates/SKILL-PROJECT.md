---
name: {proyecto}-{componente}
description: >
  {Descripción breve específica para este proyecto - 1 línea}.
  Trigger: {Cuándo debe activarse en el contexto de ESTE proyecto}.
license: MIT
metadata:
  author: {tu-nombre}
  version: "1.0"
  project: {nombre-del-proyecto}
---

# {Nombre del Skill} - {Proyecto}

> Skill específico para las convenciones y patrones de **{nombre-del-proyecto}**.

## Contexto del Proyecto

- **Tipo de Proyecto**: {Web app / API / Librería / CLI / etc.}
- **Stack Principal**: {Tecnologías principales}
- **Estructura Base**: `{ruta/principal/del/proyecto}`

---

## Cuándo Usar

Activa este skill cuando:
- Trabajes en `{ruta/específica/}` de este proyecto
- {Condición de activación específica del proyecto}
- El usuario solicite {tarea relacionada}

**No usar cuando:**
- El código no pertenece a este proyecto
- {Excepción específica}

---

## Convenciones del Proyecto

### Estructura de Carpetas

```
{raiz-proyecto}/
├── {carpeta1}/        # {Descripción}
│   ├── {subcarpeta}/  # {Descripción}
│   └── {archivo}      # {Descripción}
├── {carpeta2}/        # {Descripción}
└── {carpeta3}/        # {Descripción}
```

### Naming Conventions

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivos | {convención} | `{ejemplo}` |
| Clases | {convención} | `{ejemplo}` |
| Funciones | {convención} | `{ejemplo}` |
| Variables | {convención} | `{ejemplo}` |
| Tests | {convención} | `{ejemplo}` |

---

## Patrones Específicos del Proyecto

### Patrón 1: {Nombre del Patrón}

**Ubicación**: `{ruta/donde/se/usa}`

**Contexto**: {Por qué este patrón existe en el proyecto}

```{lenguaje}
# Referencia: {ruta/al/archivo/de/referencia}
# Ejemplo extraído del proyecto:

{código adaptado del proyecto}
```

### Patrón 2: {Nombre del Patrón}

**Ubicación**: `{ruta/donde/se/usa}`

**Contexto**: {Por qué este patrón existe en el proyecto}

```{lenguaje}
# Referencia: {ruta/al/archivo/de/referencia}

{código adaptado del proyecto}
```

---

## Referencias Locales

| Tipo | Ruta | Descripción |
|------|------|-------------|
| Documentación | `docs/{archivo}.md` | {Qué contiene} |
| Ejemplos | `{ruta}/examples/` | {Qué tipo de ejemplos} |
| Tests | `tests/{tipo}/` | {Cómo están organizados} |
| Config | `{config-file}` | {Configuración relevante} |

---

## Comandos del Proyecto

```bash
# Desarrollo local
{comando-dev}

# Ejecutar tests relacionados
{comando-test}

# Lint/formato
{comando-lint}

# Build específico
{comando-build}
```

---

## Integración con Otros Skills

Este skill puede trabajar junto con:

| Skill | Cuándo Delegar | Trigger |
|-------|----------------|---------|
| `{skill-1}` | {Condición} | {Cómo invocar} |
| `{skill-2}` | {Condición} | {Cómo invocar} |

---

## Árbol de Decisiones para Este Proyecto

```
¿El código está en {carpeta-principal}?
├── NO → No aplica este skill
└── SÍ → ¿Es un {tipo-de-componente}?
    ├── SÍ → Seguir Patrón 1
    └── NO → ¿Es un {otro-tipo}?
        ├── SÍ → Seguir Patrón 2
        └── NO → Consultar documentación en {ruta}
```

---

## Ejemplos del Proyecto

### ❌ Incorrecto para Este Proyecto

```{lenguaje}
// Este código NO sigue las convenciones del proyecto
{código incorrecto}
```

**Problema**: {Por qué viola las convenciones del proyecto}

### ✅ Correcto para Este Proyecto

```{lenguaje}
// Referencia: {ruta/al/archivo/correcto}
// Este código SÍ sigue las convenciones del proyecto
{código correcto}
```

---

## Comportamiento del Agente

Cuando trabajes en este proyecto:

1. **Verificar contexto**: Confirmar que el archivo está en `{ruta/proyecto}`
2. **Cargar referencias**: Leer `{rutas/de/referencia}` si es necesario
3. **Aplicar convenciones**: Seguir estrictamente las naming conventions
4. **Mantener consistencia**: El código nuevo debe verse como el existente
5. **Documentar cambios**: Seguir el estilo de documentación del proyecto

### Rutas Críticas

```
# Archivos que SIEMPRE debes revisar antes de hacer cambios:
{ruta/archivo/critico1}
{ruta/archivo/critico2}
```

---

## Recursos del Proyecto

- **Documentación**: Ver [references/](references/) para guías del proyecto
- **Templates**: Ver [assets/](assets/) para plantillas específicas
- **Scripts**: Ver [scripts/](scripts/) para herramientas del proyecto
