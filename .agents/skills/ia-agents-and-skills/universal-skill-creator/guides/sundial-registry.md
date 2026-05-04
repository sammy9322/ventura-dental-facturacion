# Guía: SundialHub Registry

> **Registry oficial del estándar Agent Skills (agentskills.io)**  
> Análogo a npm para el ecosistema de skills de IA. 52k+ skills públicos (2026).  
> URL: https://www.sundialhub.com/

---

## ¿Cuándo Usar SundialHub?

| Situación | Acción |
|-----------|--------|
| Antes de crear cualquier skill nuevo | **SIEMPRE buscar primero** (`search_sundial_skills.sh`) |
| Skill del registry cubre la necesidad | Instalar directamente (`install_sundial_skill.sh`) |
| Skill existe pero necesita adaptación | Instalar como base y extender localmente |
| El skill local es genérico y de calidad | Publicar al registry (`publish_to_sundial.sh`) |
| Buscar alternativas al skills.sh ecosystem | SundialHub es el registry canónico del estándar |

---

## Comandos Rápidos

### Buscar Skills

```bash
# Via script del repo (con formato y señales de confianza)
./skills/universal-skill-creator/scripts/search_sundial_skills.sh "pdf processing"

# Via CLI directamente (interactivo)
npx sundial-hub find "pdf processing"

# Output JSON para agentes
npx sundial-hub find "pdf processing" --json --limit 10

# Discovery file para agentes (listado completo legible)
# https://www.sundialhub.com/find.md
```

### Instalar Skills

```bash
# Via script del repo (con detección automática de agentes)
./skills/universal-skill-creator/scripts/install_sundial_skill.sh <author>/<skill>

# Con target específico
./skills/universal-skill-creator/scripts/install_sundial_skill.sh sundial/tinker --claude
./skills/universal-skill-creator/scripts/install_sundial_skill.sh sundial/tinker --claude --cursor

# Via CLI directamente
npx sundial-hub add <author>/<skill>             # Auto-detect
npx sundial-hub add <author>/<skill> --claude    # Solo Claude Code
npx sundial-hub add <author>/<skill> --global    # Instalación global
npx sundial-hub add <author>/<skill> --yes       # Sin confirmación
```

### Publicar Skills

```bash
# Via script del repo (con validación previa y guía interactiva)
./skills/universal-skill-creator/scripts/publish_to_sundial.sh ./skills/mi-skill \
  --changelog "Descripción del cambio" \
  --visibility public \
  --categories coding,research

# Via CLI directamente
npx sundial-hub auth login         # Solo la primera vez
npx sundial-hub push .             # Publicar skill en directorio actual
npx sundial-hub mine               # Ver tus skills publicados
```

---


## Rutas de Instalación por Agente

| Agente | Ruta Local | Flag CLI |
|--------|-----------|----------|
| **Claude Code** | `.claude/skills/<name>/SKILL.md` | `--claude` |
| **Cursor** | `.cursor/skills/<name>/SKILL.md` | `--cursor` |
| **OpenAI Codex** | `.codex/skills/<name>/SKILL.md` | `--codex` |
| **Gemini CLI** | `.gemini/skills/<name>/SKILL.md` | `--gemini` |
| **Global (Claude)** | `~/.claude/skills/<name>/SKILL.md` | `--global` |

---

## Evaluar Señales de Confianza

Al elegir un skill del registry, evaluar:

| Señal | Fuente | Peso | Criterio |
|-------|--------|------|---------|
| `installs` | JSON de find | **Alto** | >10k = alta adopción; <100 = skill nuevo |
| `safety` | JSON de find | **Alto** | Leer siempre — indica riesgos de scripts |
| `author` | JSON de find | Medio | Verificar si el autor es conocido/confiable |
| `version` | JSON de find | Medio | Versiones altas → skill maduro y mantenido |
| `docsUrl` | JSON de find | Medio | Leer SKILL.md completo antes de instalar |
| `url` | JSON de find | Bajo | Para ver descripción extendida en web |

**Criterio de decisión rápido:**

```
installs > 1000 + safety OK + version > 1 → Instalar directo
installs < 100 + sin safety info         → Revisar SKILL.md antes de instalar
installs > 0 + necesita adaptación       → Instalar y extender localmente
Sin resultados relevantes                → Crear skill local nuevo
```

---

## SundialHub vs skills.sh Ecosystem

| Aspecto | SundialHub | skills.sh |
|---------|-----------|---------|
| Registry | Oficial (agentskills.io) | Comunidad |
| Skills disponibles | 52k+ | Variable |
| Multi-agente | Sí (Claude, Cursor, Codex, Gemini...) | Principalmente Antigravity |
| Publicación | `npx sundial-hub push` | PR al repo |
| CLI | `npx sundial-hub` | `npx skills` |
| Búsqueda con señales | Sí (installs, safety, version) | No |
| Versionado inmutable | Sí | No |
| Estándar | agentskills.io (open) | skills.sh (custom) |

**Cuándo usar skills.sh:** Si buscas skills específicos del ecosistema Antigravity o encuentras algo relevante que no está en SundialHub.

Scripts para skills.sh:
- `./search_community_skills.sh` — buscar en skills.sh
- `./install_community_skill.sh` — instalar para Antigravity

---

## URLs Clave

| Propósito | URL |
|-----------|-----|
| Homepage | https://www.sundialhub.com/ |
| Explorar por categoría | https://www.sundialhub.com/explore |
| Documentación CLI | https://www.sundialhub.com/docs/cli |
| SKILL.md raw de un skill | `https://www.sundialhub.com/raw/<author>/<skill>` |
| Discovery file para agentes | https://www.sundialhub.com/find.md |
| Spec abierto (agentskills.io) | https://agentskills.io/specification |
| Validador oficial (skills-ref) | https://github.com/agentskills/agentskills/tree/main/skills-ref |
| Best practices (Anthropic) | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices |

---

## Validación con skills-ref (Opcional)

La herramienta oficial del estándar para validar skills antes de publicar:

```bash
# Instalar
pip install skills-ref

# Validar un skill local
skills-ref validate ./skills/mi-skill

# Generar XML para system prompts
skills-ref to-prompt ./skills/skill-a ./skills/skill-b
```

Valida: frontmatter, reglas del campo `name`, longitud de `description`, estructura de carpetas.

---

## Publicar un Skill: ¿Cuándo Vale la Pena?

Publicar al registry aporta valor cuando el skill es:

- **Genérico** — aplica a proyectos de otros, no solo al tuyo
- **Maduro** — probado en uso real con al menos 3 escenarios
- **Documentado** — description clara, workflow definido, ejemplos concretos
- **Independiente** — no depende de secretos ni configs privadas del proyecto

**No publicar** si el skill contiene:
- Credenciales o tokens hardcodeados
- Rutas absolutas específicas de tu máquina
- Lógica de negocio propietaria
- Información sensible del proyecto
