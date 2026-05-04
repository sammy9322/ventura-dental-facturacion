#!/bin/bash
set -euo pipefail
#
# audit_workspace.sh
# Escanea la carpeta skills/ y audita todos los skills encontrados
# generando un reporte de cumplimiento con el estándar.
#

set -e

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATOR="$SCRIPT_DIR/validate_skill.sh"

# Get target directory from argument, or auto-discover
TARGET_DIR="$1"
SKILL_ROOTS=()

if [ -n "$TARGET_DIR" ]; then
    if [ -d "$TARGET_DIR" ]; then
        SKILL_ROOTS+=("$TARGET_DIR")
    else
        echo -e "${RED}Error: Directory not found: $TARGET_DIR${NC}"
        exit 1
    fi
else
    # Auto-discover standard locations in current working directory
    POTENTIAL_ROOTS=(
        "skills"
        ".github/skills"
        ".claude/skills"
        ".gemini/skills"
        ".agent/skills"
        ".codex/skills"
    )

    for root in "${POTENTIAL_ROOTS[@]}"; do
        if [ -d "$PWD/$root" ]; then
            SKILL_ROOTS+=("$PWD/$root")
        fi
    done
fi

if [ ${#SKILL_ROOTS[@]} -eq 0 ]; then
    echo -e "${YELLOW}No standard skill directories found in current workspace.${NC}"
    echo "Checked: skills/, .github/skills/, .claude/skills/, .gemini/skills/, .agent/skills/"
    echo "Usage: $0 [specific-skills-dir]"
    exit 0
fi

echo ""
echo -e "${BOLD}${BLUE}🔍 Auditoría de Skills del Workspace${NC}"
echo "========================================"

# Main loop over all found roots
TOTAL=0
VALID=0
INVALID=0
WARNING=0

for SKILLS_ROOT in "${SKILL_ROOTS[@]}"; do
    echo "Scanning: ${BOLD}$SKILLS_ROOT${NC}"

    # Buscar directorios en root (nivel 1)
    # Use find to get directories containing SKILL.md or just directories? 
    # Standard is directory per skill.
    
    current_skills=$(find "$SKILLS_ROOT" -maxdepth 1 -mindepth 1 -type d | sort)
    
    if [ -z "$current_skills" ]; then
        echo "  (No skills found in this directory)"
        continue
    fi
    
    for skill in $current_skills; do
    skill_name=$(basename "$skill")
    echo -n "Auditando ${BOLD}$skill_name${NC}..."
    
    # Ejecutar validador en modo silencioso para obtener status
    set +e
    output=$("$VALIDATOR" "$skill")
    status=$?
    set -e
    
    # Analizar resultado
    if [ $status -eq 0 ]; then
        # Check warnings in output
        if echo "$output" | grep -q "VÁLIDO"; then
            echo -e " ${YELLOW}⚠ Advertencias${NC}"
            WARNING=$((WARNING + 1))
        else
            echo -e " ${GREEN}✓ OK${NC}"
            VALID=$((VALID + 1))
        fi
    else
        echo -e " ${RED}✗ Errores${NC}"
        # Mostrar resumen de errores
        echo "$output" | grep "✗" | sed 's/^/  /'
        INVALID=$((INVALID + 1))
    fi
    TOTAL=$((TOTAL + 1))
done
    echo ""
done

echo ""
echo "========================================"
echo -e "${BOLD}Resumen de Auditoría:${NC}"
echo "Total Skills: $TOTAL"
echo -e "${GREEN}Verificados:  $VALID${NC}"
echo -e "${YELLOW}Con Warnings: $WARNING${NC}"
echo -e "${RED}Inválidos:    $INVALID${NC}"
echo ""

if [ "$INVALID" -gt 0 ]; then
    echo -e "${YELLOW}Recomendación:${NC} Ejecuta el proceso de Normalización para los skills inválidos."
    echo "Referencia: skills/universal-skill-creator/guides/normalization.md"
    exit 1
else
    echo -e "${GREEN}¡Excelente! Todos los skills cumplen con el estándar.${NC}"
    exit 0
fi
