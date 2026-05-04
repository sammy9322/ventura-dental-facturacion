#!/bin/bash
set -euo pipefail
#
# manage_skills.sh
# Herramienta de gestión para eliminar skills y limpiar huérfanos.
#

set -e

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
SKILLS_DIR="$REPO_ROOT/skills"

# Directorios de agentes soportados en el proyecto
PROJECT_AGENT_DIRS=(
    "$REPO_ROOT/.claude/skills"
    "$REPO_ROOT/.gemini/skills"
    "$REPO_ROOT/.agent/skills"
    "$REPO_ROOT/.github/skills"
    "$REPO_ROOT/.codex/skills"
)

# Directorios globales conocidos
GLOBAL_AGENT_DIRS=(
    "$HOME/.claude/skills"
    "$HOME/.gemini/antigravity/skills"
    "$HOME/.copilot/skills"
)

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# =============================================================================
# FUNCIONES
# =============================================================================

usage() {
    echo "Uso: $0 {delete|prune|list} [nombre_skill]"
    echo ""
    echo "Comandos:"
    echo "  delete <nombre>   Elimina un skill del repositorio y sus referencias globales."
    echo "  prune             Elimina enlaces simbólicos rotos (huérfanos)."
    echo "  list              Lista los skills instalados."
    echo ""
    exit 1
}

protected_check() {
    local name="$1"
    if [ "$name" == "universal-skill-creator" ]; then
        echo -e "${RED}ERROR: No se puede eliminar 'universal-skill-creator'.${NC}"
        echo "Este skill es esencial para la gestión del sistema."
        exit 1
    fi
}

cmd_list() {
    echo -e "${BLUE}Skills Instalados:${NC}"
    ls -1 "$SKILLS_DIR" | grep -v "^scripts$"
}

cmd_delete() {
    local name="$1"
    
    if [ -z "$name" ]; then
        echo -e "${RED}Error: Debes especificar el nombre del skill a eliminar.${NC}"
        usage
    fi
    
    protected_check "$name"
    
    echo -e "${BOLD}Proceso de eliminación para: ${RED}$name${NC}"
    echo "------------------------------------------------"
    
    local found=false
    
    # 1. Eliminar del repositorio principal/source
    if [ -d "$SKILLS_DIR/$name" ]; then
        echo -n "Eliminando source $SKILLS_DIR/$name... "
        rm -f -r "$SKILLS_DIR/$name"
        echo -e "${GREEN}✓${NC}"
        found=true
    else
        echo -e "${YELLOW}Aviso: No encontrado en source $SKILLS_DIR/$name${NC}"
    fi
    
    # 2. Buscar y eliminar en globales (copias o links individuales)
    for dir in "${GLOBAL_AGENT_DIRS[@]}"; do
        if [ -d "$dir/$name" ] || [ -L "$dir/$name" ]; then
            echo -n "Eliminando global en $dir/$name... "
            rm -f -r "$dir/$name"
            echo -e "${GREEN}✓${NC}"
            found=true
        fi
    done
    
    if [ "$found" = true ]; then
        echo -e "${GREEN}Skill '$name' eliminado correctamente.${NC}"
    else
        echo -e "${YELLOW}No se encontraron rastros del skill '$name'.${NC}"
    fi
    
    # Automatizar prune después de delete por si acaso
    echo ""
    cmd_prune
}

cmd_prune() {
    echo -e "${BOLD}Buscando enlaces huérfanos (prune)...${NC}"
    local orphans=0
    
    # Lista combinada de directorios a revisar
    local all_dirs=("${PROJECT_AGENT_DIRS[@]}" "${GLOBAL_AGENT_DIRS[@]}")
    
    for dir in "${all_dirs[@]}"; do
        # Verificar si el directorio existe
        if [ -d "$dir" ]; then
            # Buscar links rotos dentro del directorio
            # -xtype l encuentra symlinks que apuntan a nada
            while IFS= read -r link; do
                if [ -n "$link" ]; then
                    echo -n "Eliminando huérfano: $link... "
                    rm "$link"
                    echo -e "${GREEN}✓${NC}"
                    orphans=$((orphans + 1))
                fi
            done < <(find "$dir" -maxdepth 1 -xtype l 2>/dev/null)
        fi
    done
    
    if [ "$orphans" -eq 0 ]; then
        echo -e "${GREEN}No se encontraron enlaces rotos.${NC}"
    else
        echo -e "${GREEN}Se eliminaron $orphans enlaces huérfanos.${NC}"
    fi
}

# =============================================================================
# MAIN
# =============================================================================

case "$1" in
    delete)
        cmd_delete "$2"
        ;;
    prune)
        cmd_prune
        ;;
    list)
        cmd_list
        ;;
    *)
        usage
        ;;
esac
