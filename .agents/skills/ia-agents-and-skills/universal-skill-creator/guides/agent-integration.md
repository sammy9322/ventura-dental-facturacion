# Guía: Integración de Skills con Agentes

Esta guía explica cómo configurar agentes para que **auto-invoquen** skills
automáticamente cuando detecten tareas relevantes.

---

## 🎯 ¿Qué es la Auto-Invocación?

Por defecto, los skills solo se activan cuando:
1. El usuario menciona explícitamente el skill
2. El agente detecta un match semántico con el `description`

La **auto-invocación** permite configurar el agente para que:
- Cargue skills específicos para ciertos tipos de tareas
- Aplique reglas automáticamente sin intervención del usuario
- Siga convenciones del proyecto de forma consistente

---

## 📝 Paso 1: Crear el Archivo de Configuración

### Para Antigravity/Gemini

Crea o edita el archivo `AGENTS.md` en la raíz del proyecto:

```markdown
# Configuración de Agentes

## Skills Disponibles

| Skill | Descripción | Trigger Automático | Archivo |
|-------|-------------|-------------------|---------|
| `clean-code` | Principios de código limpio | Cuando se escribe Python | [SKILL.md](skills/clean-code/SKILL.md) |
| `project-api` | Convenciones de la API | Cuando se trabaja en `src/api/` | [SKILL.md](skills/project-api/SKILL.md) |
| `testing` | Guías de testing | Cuando se crean tests | [SKILL.md](skills/testing/SKILL.md) |

## Instrucciones para el Agente

Cuando trabajes en este proyecto:

1. **Antes de escribir código Python**, carga el skill `clean-code`
2. **Cuando modifiques archivos en `src/api/`**, carga el skill `project-api`
3. **Cuando crees o modifiques tests**, carga el skill `testing`

Para cargar un skill, ejecuta:
\`\`\`
view_file("skills/{nombre-skill}/SKILL.md")
\`\`\`
```

### Para Claude Code (Anthropic)

Usa el archivo `.claude/CLAUDE.md` o similar:

```markdown
# Agent Configuration

## Auto-Load Skills

When working on this project, the agent should automatically load
specific skills based on context:

### Trigger: Python Development
- **Condition**: Any task involving Python files
- **Skill**: `skills/clean-code/SKILL.md`
- **Action**: Read skill before writing Python code

### Trigger: API Work
- **Condition**: Files in `src/api/` directory
- **Skill**: `skills/project-api/SKILL.md`
- **Action**: Follow project conventions

### Trigger: Testing
- **Condition**: Files in `tests/` or creating test files
- **Skill**: `skills/testing/SKILL.md`
- **Action**: Apply testing best practices
```

---

## 📂 Paso 2: Estructura Sugerida

```
proyecto/
├── .agent/                    # Antigravity
│   ├── skills/
│   │   ├── skill-1/SKILL.md
│   │   └── skill-2/SKILL.md
│   └── AGENTS.md             # Configuración central
├── .claude/                   # Claude Code
│   └── CLAUDE.md
├── src/
├── tests/
└── README.md
```

---

## 🔧 Paso 3: Configurar Triggers Automáticos

### Tipos de Triggers

| Tipo de Trigger | Ejemplo | Skill Sugerido |
|-----------------|---------|----------------|
| **Por directorio** | `src/api/*` | `project-api` |
| **Por extensión** | `*.py` | `python-clean-code` |
| **Por tarea** | "crear test" | `testing` |
| **Por convención** | "refactorizar" | `clean-code` |
| **Por tecnología** | "React component" | `react-19` |

### Ejemplo de Configuración Detallada

```markdown
## Triggers Automáticos

### Trigger: Archivos Python en `src/`
- **Pattern**: `src/**/*.py`
- **Skills a cargar**: 
  1. `clean-code` (primero)
  2. `project-conventions` (después)
- **Prioridad**: Alta

### Trigger: Archivos de Test
- **Pattern**: `tests/**/*.py` o archivo que contenga "test"
- **Skills a cargar**: `testing`
- **Prioridad**: Normal

### Trigger: Documentación
- **Pattern**: `docs/**/*.md` o `*.md`
- **Skills a cargar**: `documentation`
- **Prioridad**: Baja
```

---

## 🤖 Paso 4: Instrucciones Explícitas para el Agente

Agrega estas instrucciones al archivo de configuración:

```markdown
## Comportamiento del Agente

### Al inicio de cada tarea

1. Identificar el tipo de tarea (código, test, docs, etc.)
2. Verificar si hay skills configurados para este tipo
3. Si hay skills relevantes:
   - Ejecutar `view_file("skills/{nombre}/SKILL.md")`
   - Leer las instrucciones ANTES de actuar
4. Seguir las instrucciones del skill durante la tarea

### Durante la ejecución

- Si el skill indica delegar a otro skill, cargarlo
- Si no hay skill para una sub-tarea, preguntar al usuario
- Reportar qué skills se aplicaron al finalizar

### Formato de Reporte

Al completar una tarea, incluir:

\`\`\`markdown
**Skills aplicados**: 
- `clean-code`: Verificación de naming
- `project-api`: Estructura de endpoints

**Mejoras realizadas**:
- Renombrado de variables para claridad
- Agregado de docstrings
\`\`\`
```

---

## ⚡ Paso 5: Configuración de Prioridades

Cuando múltiples skills podrían aplicar:

```markdown
## Orden de Precedencia de Skills

1. **Skills específicos del proyecto** (siempre primero)
   - `project-api`, `project-models`, etc.
   
2. **Skills de convenciones generales**
   - `clean-code`, `clean-names`, etc.
   
3. **Skills de tecnología**
   - `python`, `typescript`, `react`
   
4. **Skills orquestadores** (coordinan otros)
   - `boy-scout`, `quality-orchestrator`

Cuando hay conflicto:
- El skill más específico gana
- Seguir las reglas del proyecto sobre las genéricas
```

---

## 🔄 Paso 6: Actualización y Mantenimiento

### Agregar Nuevo Skill a la Configuración

1. Crear el skill en `skills/{nombre}/SKILL.md`
2. Definir triggers apropiados
3. Agregar a `AGENTS.md`:

```markdown
| `nuevo-skill` | {descripción} | {cuándo} | [SKILL.md](skills/nuevo-skill/SKILL.md) |
```

4. Agregar instrucciones de trigger si es necesario

### Desactivar Skill Temporalmente

```markdown
<!-- DESACTIVADO temporalmente
| `skill-en-pausa` | ... | ... | ... |
-->
```

### Versionar Configuración

```markdown
## Historial de Cambios

- **v1.1** (2025-01-27): Agregado skill `nuevo-feature`
- **v1.0** (2025-01-15): Configuración inicial
```

---

## 📋 Checklist de Integración

Al configurar auto-invocación para un nuevo skill:

- [ ] El skill está creado y funcional
- [ ] Agregado a la tabla de skills en `AGENTS.md`
- [ ] Definidos los triggers de activación
- [ ] Especificada la prioridad (si hay conflictos potenciales)
- [ ] Probado que el agente lo carga correctamente
- [ ] Documentado en el README del proyecto (opcional)

---

## 🧪 Paso 7: Probar la Configuración

### Test Manual

1. Iniciar una nueva sesión con el agente
2. Solicitar una tarea que debería activar el skill
3. Verificar que el agente:
   - Menciona que cargó el skill
   - Sigue las instrucciones del skill
   - Reporta la aplicación al finalizar

### Ejemplo de Interacción Esperada

```
Usuario: "Crea un nuevo endpoint para usuarios"

Agente: Voy a crear el endpoint. Primero, cargo los skills relevantes...
[Carga project-api]
[Carga clean-code]

Siguiendo las convenciones del proyecto:
- Endpoint en `src/api/users/`
- Naming según PEP 8
- Estructura de response estándar

[... código generado ...]

**Skills aplicados**: project-api, clean-code
```

---

## 📚 Recursos Adicionales

- **Antigravity Skills Guide**: https://antigravity.google/docs/skills
- **Claude Code Agent Skills**: https://platform.claude.com/docs/agents-and-tools/agent-skills
- **Agent Skills Standard**: https://agentskills.io
