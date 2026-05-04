# Checklist: Pre-Creación de Skill

Usa esta lista **antes** de comenzar a crear un skill.

---

## ✅ Verificaciones Obligatorias

### 1a. ¿El skill ya existe localmente?

```bash
# Buscar skills existentes en el workspace
ls -la skills/
ls -la ~/.gemini/antigravity/skills/  # Si buscas globales
```

- [ ] Revisé la carpeta `skills/` del proyecto
- [ ] Revisé los skills globales (si aplica)
- [ ] No existe un skill local que cubra este caso

### 1b. ¿Existe en SundialHub? (Registry Oficial)

```bash
# OBLIGATORIO: buscar en el registry antes de crear
./skills/universal-skill-creator/scripts/search_sundial_skills.sh "<keywords del skill>"
```

- [ ] Ejecuté `search_sundial_skills.sh` con keywords relevantes
- [ ] Evaluté las señales de confianza de los resultados:
  - [ ] `installs` — adopción de la comunidad
  - [ ] `safety` — riesgos de scripts (revisar si tiene scripts)
  - [ ] `version` — madurez del skill
- [ ] Revisé el SKILL.md del skill más relevante (si existe)
- [ ] Decidí: **No existe skill adecuado** en SundialHub → continuar

> Si encontraste un skill adecuado, detener aquí e instalar:
> `./skills/universal-skill-creator/scripts/install_sundial_skill.sh <author>/<skill>`

### 1c. ¿Existe en skills.sh? (Ecosistema Alternativo)

```bash
./skills/universal-skill-creator/scripts/search_community_skills.sh "<keywords>"
```

- [ ] Busqué en skills.sh para asegurarme de no duplicar
- [ ] No existe una alternativa adecuada en este ecosistema

### 2. ¿Es realmente necesario un skill?

- [ ] El patrón se usa repetidamente (no es una tarea única)
- [ ] No existe documentación que pueda referenciar en su lugar
- [ ] El patrón no es trivial ni autodocumentado
- [ ] La IA necesita guía específica para hacerlo bien

### 3. ¿Qué tipo de skill es?

| Tipo | Características | Decisión |
|------|-----------------|----------|
| **Genérico** | Aplica a cualquier proyecto | `SKILL-GENERIC.md` |
| **Específico** | Solo para este proyecto | `SKILL-PROJECT.md` |
| **Orquestador** | Coordina otros skills | `SKILL-ORCHESTRATOR.md` |

- [ ] Identifiqué el tipo de skill claramente

### 4. ¿Hay código de referencia?

Si el skill es **específico** o necesita ejemplos reales:

- [ ] El usuario indicó rutas de referencia
- [ ] Los archivos de referencia existen y son accesibles
- [ ] Los patrones en el código son claros y consistentes

Si **no hay referencias**:
- [ ] Usaré ejemplos genéricos del template
- [ ] Solicitaré ejemplos al usuario

### 5. ¿Dónde se ubicará el skill?

| Ubicación | Cuándo Usar |
|-----------|-------------|
| `.agent/skills/` | Solo este proyecto |
| `~/.gemini/antigravity/skills/` | Todos los proyectos |

- [ ] Definí la ubicación con el usuario

---

## 📝 Información Recopilada

Antes de crear, asegúrate de tener:

```markdown
- Nombre del skill: ________________________________
- Descripción (1-2 líneas): ________________________
- Trigger (cuándo activar): ________________________
- Tipo: [ ] Genérico  [ ] Específico  [ ] Orquestador
- Ubicación: [ ] Proyecto  [ ] Global
- Referencias de código (rutas): ___________________
- ¿Auto-invocación?: [ ] Sí  [ ] No
```

---

## ⚠️ Señales de que NO debes crear un skill

- El patrón es obvio para cualquier desarrollador
- Ya existe documentación exhaustiva
- Es una configuración que va mejor en un archivo de config
- Solo lo usarás una vez
- Duplicaría instrucciones de otro skill existente

---

## ✓ Listo para Crear

Una vez que todas las verificaciones estén marcadas:

1. Elegir el template apropiado
2. Crear la estructura de carpetas
3. Poblar el SKILL.md
4. Agregar assets/scripts si es necesario
5. Ejecutar checklist de validación
