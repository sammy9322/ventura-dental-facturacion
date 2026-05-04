---
name: skill-sync
description: >
  Sincroniza automáticamente la metadata de auto-invocación en archivos AGENT.md.
  Lee skills disponibles y actualiza tablas de delegación.
  Trigger: Al crear/modificar skills, o manualmente para actualizar docs.
license: MIT
metadata:
  author: mapplics
  version: "1.0"
  type: maintenance
allowed-tools: Read, Write, Run, Grep
---

# Skill Sync

Este skill mantiene la "Documentación Activa" de tu ecosistema de agentes.
Escanea todos los skills instalados buscando metadata de `auto_invoke` y `scope`, y actualiza las tablas de referencia en los archivos `AGENT.md` correspondientes.

## 🚀 Uso

### Manual
Para resincronizar todo el repositorio:

```bash
./skills/skill-sync/scripts/sync.sh
```

### Opciones
- `--dry-run`: Muestra qué cambiaría sin editar archivos.
- `--scope {nombre}`: Sincroniza solo un scope específico (ej: `api`, `ui`).

## ⚙️ Cómo Funciona

1. **Escaneo**: Busca archivos `SKILL.md` en `skills/`.
2. **Extracción**: Lee el frontmatter buscando:
   - `scope`: Dónde debe aparecer el skill (ej: `root`, `api`).
   - `auto_invoke`: Qué acción dispara este skill (ej: "Crear endpoint").
3. **Mapeo**: Asocia scopes a rutas de `AGENT.md` (configurado en el script).
4. **Inyección**: Busca la sección `### Auto-invoke Skills` en el `AGENT.md` y regenera la tabla.

## 📝 Configuración

El mapeo de scopes se define en `scripts/sync.sh` dentro de la función `get_agents_path`.
Si añades una nueva carpeta de dominio (ej: `mobile/`), edita el script para incluirla:

```bash
get_agents_path() {
    case "$scope" in
        root) echo "$REPO_ROOT/AGENT.md" ;;
        api)  echo "$REPO_ROOT/backend/AGENT.md" ;;
        # Nuevo scope
        mobile) echo "$REPO_ROOT/mobile/AGENT.md" ;;
    esac
}
```
