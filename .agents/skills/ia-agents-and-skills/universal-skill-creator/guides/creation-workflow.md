# Flujo de Trabajo de Creación de Skills

Esta guía detalla el proceso interactivo que el agente debe seguir al crear un nuevo skill.

## Fase 0: Discovery (OBLIGATORIO — Dos Pasos)

Antes de crear un skill, busca si ya existe algo similar en la comunidad **en ambos registries**:

### Paso 0a: Buscar en SundialHub (Registry Primario)

SundialHub es el registry oficial del estándar `agentskills.io` (52k+ skills, multi-agente).

1. **Identificar keywords** del skill solicitado por el usuario.
2. **Buscar en SundialHub:**
   ```bash
   ./skills/universal-skill-creator/scripts/search_sundial_skills.sh "<keywords>"
   ```
3. **Evaluar resultados** usando señales de confianza:

   | Señal | Criterio de aceptación |
   |-------|------------------------|
   | `installs` | >1000 = alta confianza; <100 = skill nuevo, revisar |
   | `safety` | Leer siempre si el skill tiene scripts |
   | `version` | >1 indica skill maduro y mantenido |
   | `author` | Verificar si es conocido o tiene historial |

4. **Decisión:**
   - ✅ Skill relevante con buenas señales → `./scripts/install_sundial_skill.sh <author>/<skill> --claude`
   - ⚠️ Skill existe pero necesita adaptación → Instalar como base y extender
   - ❌ Ninguno aplica → Paso 0b

### Paso 0b: Buscar en skills.sh Ecosystem (Alternativo)

Si SundialHub no arrojó resultados relevantes:

```bash
./skills/universal-skill-creator/scripts/search_community_skills.sh "<keywords>"
```

- ✅ Instalar existente → `npx -y skills add <repo> --skill <nombre> -a antigravity -y`
- ❌ Ninguno aplica → Continuar con Fase 1

---

## Fase 1: Descubrimiento (Cuestionario)

Antes de crear cualquier skill, haz estas preguntas al usuario:

1. **Propósito**: ¿Qué tarea o comportamiento quieres que el agente aprenda?
2. **Ámbito del Skill**:
   - [ ] GENÉRICO: Aplica a cualquier proyecto (ej: pytest, clean-code)
   - [ ] ESPECÍFICO: Solo para este proyecto (ej: convenciones propias)
   - [ ] ORQUESTADOR: Coordina otros skills
3. **Referencias** (si es específico): ¿Qué archivos ejemplifican el patrón?
4. **Integración**: ¿Deseas auto-invocación?
5. **Documentación**: ¿Existe documentación base?

## Fase 2: Análisis de Necesidad

Analiza la respuesta sobre la documentación:

- **Escueta/Trivial**: NO crear skill. Recomendar custom instructions.
- **Ideal/Patrones**: SÍ crear skill. Capturar el "Know-How".
- **Extensa/Monolítica**: FRAGMENTAR. Proponer estructura modular.

*Criterio Clave*: El skill transforma información pasiva en instrucción activa.

## Fase 3: Diseño de Estructura

Propón la estructura antes de escribir código:

```markdown
skills/{nombre-skill}/
├── SKILL.md              # Instrucciones principales
├── assets/               # Templates y recursos
└── scripts/              # Herramientas de automatización
```

## Fase 4: Implementación

1. Crear carpetas.
2. Usar el template adecuado (`assets/templates/`).
3. Si hay referencias de proyecto, leer archivos y extraer patrones reales.
4. Generar ejemplos de código "Correcto" vs "Incorrecto".

## Fase 5: Integración

Si se solicitó auto-invocación, instruye al usuario para agregar el skill a `AGENTS.md`:

```markdown
| Skill | Trigger | Archivo |
|-------|---------|---------|
| `{nombre}` | {cuándo activar} | [SKILL.md](skills/{nombre}/SKILL.md) |
```

## Fase 6: Auditoría y Calidad (Mandatory)

Antes de dar el skill por terminado, DEBES validar que cumpla el estándar:

1. Ejecutar el script de auditoría:
   ```bash
   ./skills/universal-skill-creator/scripts/audit_workspace.sh
   ```
2. Corregir cualquier **Warning** o **Error**.
3. Verificar que `SKILL.md` tenga las secciones estándar ("Cuándo Usar", "Patrones Críticos").

## Fase 7: Despliegue y Configuración

Ofrece ejecutar el script de configuración:

```bash
./skills/universal-skill-creator/scripts/setup_agents.sh --all
```

---

## Fase 8: Publishing a SundialHub (Opcional)

Si el skill creado es **genérico** (aplica a otros proyectos) y está maduro, ofrecer al usuario publicarlo al registry:

**Criterios para publicar:**
- [ ] El skill es genérico — no depende de configs privadas del proyecto
- [ ] Está probado con al menos 3 escenarios reales
- [ ] No contiene credenciales ni rutas absolutas
- [ ] La descripción es clara y tiene triggers específicos
- [ ] **🔒 Scan de seguridad pasado** (obligatorio, se ejecuta automáticamente)

### Paso 8a: Scan de Seguridad (OBLIGATORIO)

El scan se ejecuta automáticamente al publicar, pero puede ejecutarse manualmente:

```bash
# Scan pre-publicación (detecta tokens, passwords, IPs, claves privadas)
./skills/universal-skill-creator/scripts/scan_sensitive_data.sh ./skills/<nombre-skill>
```

Si falla, corregir TODOS los hallazgos antes de continuar.

### Paso 8b: Publicar

```bash
# Opción A: Via CLI (con scan + validación automáticos)
./skills/universal-skill-creator/scripts/publish_to_sundial.sh ./skills/<nombre-skill> \
  --changelog "Descripción del skill" \
  --visibility public \
  --categories <categoría>

# Opción B: Via API directa (sin Node.js, solo curl)
./skills/universal-skill-creator/scripts/ publish ./skills/<nombre-skill> \
  --version 1 --categories coding --changelog "Initial release"
```

Categorías disponibles: `product`, `research`, `coding`, `creative`, `learning`, `marketing`, `admin`, `financial`, `writing`, `community`, `outreach`, `health`, `other`

**Referencia completa:** Ver [guides/sundial-registry.md](sundial-registry.md) y [guides/api-and-security.md](api-and-security.md)
