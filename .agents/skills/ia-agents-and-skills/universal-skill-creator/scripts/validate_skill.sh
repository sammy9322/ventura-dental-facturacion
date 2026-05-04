#!/bin/bash
set -euo pipefail
#
# validate_skill.sh
# Valida la estructura y contenido básico de un skill
#
# Uso: ./validate_skill.sh <ruta-al-skill>
# Ejemplo: ./validate_skill.sh skills/mi-skill
#

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0
PASSED=0

# Funciones de output
pass() {
    echo -e "${GREEN}✓${NC} $1"
    PASSED=$((PASSED + 1))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

# Verificar argumento
if [ -z "$1" ]; then
    echo "Uso: $0 <ruta-al-skill>"
    echo "Ejemplo: $0 skills/mi-skill"
    exit 1
fi

SKILL_PATH="$1"
SKILL_MD="$SKILL_PATH/SKILL.md"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Validando Skill: $SKILL_PATH"
echo "════════════════════════════════════════════════════════════"
echo ""

# ============================================================
# VALIDACIONES DE ESTRUCTURA
# ============================================================

echo "📁 ESTRUCTURA DE ARCHIVOS"
echo "─────────────────────────────────────────────────────────"

# Verificar que existe el directorio
if [ -d "$SKILL_PATH" ]; then
    pass "Directorio del skill existe"
else
    fail "Directorio del skill no existe: $SKILL_PATH"
    exit 1
fi

# Verificar que existe SKILL.md
if [ -f "$SKILL_MD" ]; then
    pass "SKILL.md existe"
else
    fail "SKILL.md no encontrado en $SKILL_PATH"
    exit 1
fi

# Verificar nombre de carpeta (kebab-case)
FOLDER_NAME=$(basename "$SKILL_PATH")
if [[ "$FOLDER_NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
    pass "Nombre de carpeta sigue kebab-case: $FOLDER_NAME"
else
    warn "Nombre de carpeta debería ser kebab-case: $FOLDER_NAME"
fi

# Verificar carpetas opcionales
if [ -d "$SKILL_PATH/assets" ]; then
    pass "Carpeta assets/ encontrada"
fi

if [ -d "$SKILL_PATH/scripts" ]; then
    pass "Carpeta scripts/ encontrada"
fi

if [ -d "$SKILL_PATH/guides" ]; then
    pass "Carpeta guides/ encontrada"
fi

if [ -d "$SKILL_PATH/references" ]; then
    pass "Carpeta references/ encontrada"
fi

echo ""

# ============================================================
# VALIDACIONES DE FRONTMATTER
# ============================================================

echo "📋 FRONTMATTER YAML"
echo "─────────────────────────────────────────────────────────"

# Verificar que empieza con ---
if head -1 "$SKILL_MD" | grep -q "^---$"; then
    pass "Frontmatter comienza correctamente"
else
    fail "SKILL.md debe comenzar con '---'"
fi

# Extraer frontmatter
FRONTMATTER=$(sed -n '/^---$/,/^---$/p' "$SKILL_MD" | tail -n +2 | head -n -1)

# Verificar campo name
# Verificar campo name
if echo "$FRONTMATTER" | grep -q "^name:"; then
    NAME=$(echo "$FRONTMATTER" | grep "^name:" | head -1 | sed 's/name: *//' | tr -d '\r')
    
    # Validar formato kebab-case estricto (Copilot requirement)
    if [[ "$NAME" =~ ^[a-z0-9-]+$ ]]; then
        # Validar longitud
        if [ ${#NAME} -le 64 ]; then
            pass "Campo 'name' válido: $NAME"
        else
            fail "Campo 'name' demasiado largo ($NAME). Máximo 64 caracteres."
        fi
    else
        fail "Campo 'name' inválido ($NAME). Debe ser kebab-case (a-z, 0-9, -) para compatibilidad con Copilot."
    fi
else
    fail "Campo 'name' requerido no encontrado"
fi

# Verificar campo description
if echo "$FRONTMATTER" | grep -q "^description:"; then
    pass "Campo 'description' encontrado"
    
    # Verificar que description incluye trigger
    if grep -A 5 "^description:" "$SKILL_MD" | grep -qi "trigger"; then
        pass "Description incluye información de trigger"
    else
        warn "Description debería incluir cuándo activar el skill (Trigger)"
    fi
else
    fail "Campo 'description' requerido no encontrado"
fi

# Verificar metadata
if echo "$FRONTMATTER" | grep -q "^metadata:"; then
    pass "Sección 'metadata' encontrada"
    
    # Verificar author
    if echo "$FRONTMATTER" | grep -q "author:"; then
        pass "Campo 'metadata.author' encontrado"
    else
        warn "Campo 'metadata.author' recomendado"
    fi
    
    # Verificar version
    if echo "$FRONTMATTER" | grep -q "version:"; then
        pass "Campo 'metadata.version' encontrado"
    else
        warn "Campo 'metadata.version' recomendado"
    fi
else
    warn "Sección 'metadata' recomendada"
fi

# Verificar license
if echo "$FRONTMATTER" | grep -q "^license:"; then
    pass "Campo 'license' encontrado"
else
    warn "Campo 'license' recomendado"
fi

echo ""

# ============================================================
# VALIDACIONES DE CONTENIDO
# ============================================================

echo "📝 CONTENIDO DEL SKILL"
echo "─────────────────────────────────────────────────────────"

# Verificar sección "When to Use" o equivalente (ahora soporta Trigger/Módulo)
if grep -qi "when to use\|cuándo usar\|cuando usar\|trigger\|módulo" "$SKILL_MD"; then
    pass "Sección 'When to Use' / 'Trigger' encontrada"
else
    fail "Sección 'When to Use', 'Cuándo Usar' o 'Trigger' requerida"
fi

# Verificar ejemplos de código
if grep -q '```' "$SKILL_MD"; then
    CODE_BLOCKS=$(grep -c '```' "$SKILL_MD")
    CODE_BLOCKS=$((CODE_BLOCKS / 2))
    if [ "$CODE_BLOCKS" -ge 1 ]; then
        pass "Ejemplos de código encontrados ($CODE_BLOCKS bloques)"
    fi
else
    warn "Se recomienda incluir ejemplos de código"
fi

# Verificar instrucciones para el agente
if grep -qi "comportamiento del agente\|ai behavior\|agent behavior" "$SKILL_MD"; then
    pass "Sección de comportamiento del agente encontrada"
else
    warn "Se recomienda sección 'Comportamiento del Agente'"
fi

# Verificar árbol de decisiones (opcional pero recomendado)
if grep -qi "árbol de decisiones\|decision tree\|decisión" "$SKILL_MD"; then
    pass "Árbol de decisiones encontrado"
fi

# Verificar antipatrones
if grep -q '❌\|incorrecto\|mal\|no hacer' "$SKILL_MD"; then
    pass "Antipatrones documentados"
fi

# Verificar patrones correctos
if grep -q '✅\|correcto\|bien\|hacer' "$SKILL_MD"; then
    pass "Patrones correctos documentados"
fi

echo ""

# ============================================================
# ============================================================

# ESTADÍSTICAS DEL SKILL
# ============================================================

echo "📊 ESTADÍSTICAS"
echo "─────────────────────────────────────────────────────────"

LINES=$(wc -l < "$SKILL_MD")
WORDS=$(wc -w < "$SKILL_MD")
CHARS=$(wc -c < "$SKILL_MD")

echo "   Líneas: $LINES"
echo "   Palabras: $WORDS"
echo "   Caracteres: $CHARS"

if [ "$LINES" -lt 50 ]; then
    warn "El skill parece corto ($LINES líneas). Considerar agregar más detalle."
elif [ "$LINES" -gt 500 ]; then
    warn "El skill es muy largo ($LINES líneas). Considerar dividir en guides/"
else
    pass "Longitud del skill apropiada ($LINES líneas)"
fi

echo ""

# ============================================================
# RESUMEN
# ============================================================

echo "════════════════════════════════════════════════════════════"
echo "  RESUMEN DE VALIDACIÓN"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "  ${GREEN}Pasaron:${NC}     $PASSED"
echo -e "  ${YELLOW}Warnings:${NC}    $WARNINGS"
echo -e "  ${RED}Errores:${NC}     $ERRORS"
echo ""

TOTAL=$((PASSED + WARNINGS + ERRORS))
SCORE=$((PASSED * 100 / TOTAL))

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "  ${GREEN}PERFECTO${NC} - El skill está completamente validado ✓"
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "  ${YELLOW}VÁLIDO${NC} - El skill es funcional pero puede mejorarse"
else
    echo -e "  ${RED}INVÁLIDO${NC} - El skill tiene errores que deben corregirse"
fi

echo ""
echo "  Puntuación: $SCORE%"
echo ""

# Exit code basado en errores
if [ "$ERRORS" -gt 0 ]; then
    exit 1
else
    exit 0
fi
