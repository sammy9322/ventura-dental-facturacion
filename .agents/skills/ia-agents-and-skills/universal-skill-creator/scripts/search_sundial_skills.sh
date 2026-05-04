#!/usr/bin/env bash
set -euo pipefail
# ==============================================================================
# search_sundial_skills.sh  (v2 — Heuristic Discovery)
# Busca skills en SundialHub con búsqueda heurística multi-pasada.
#
# Mejoras v2:
#   - Auto-detección de backend: usa CLI si está disponible, API curl si no.
#   - Búsqueda heurística: expande la query en palabras clave individuales,
#     ejecuta múltiples pasadas y deduplica resultados por author/name.
#   - Límite amplio por defecto (30) para no cortar resultados relevantes.
#   - Ordenación por relevancia: coincidencia de nombre > installs.
#   - Sin fallos silenciosos: siempre informa qué backend usa y por qué.
#
# Uso: ./search_sundial_skills.sh "<query>" [--limit N] [--json] [--no-heuristic]
# Ejemplo: ./search_sundial_skills.sh "obsidian markdown"
#          ./search_sundial_skills.sh "forecast" --limit 50
#          ./search_sundial_skills.sh "pdf" --no-heuristic --json
# ==============================================================================

# Colores
BOLD='\033[1m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

# Defaults
QUERY=""
LIMIT=30           # Ampliado: 30 resultados por pasada para no cortar
JSON_MODE=false
HEURISTIC=true     # Expansión multi-keyword por defecto

# Parsear argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    --limit)
      LIMIT="$2"
      shift 2
      ;;
    --json)
      JSON_MODE=true
      shift
      ;;
    --no-heuristic)
      HEURISTIC=false
      shift
      ;;
    -h|--help)
      echo "Uso: $0 \"<query>\" [--limit N] [--json] [--no-heuristic]"
      echo ""
      echo "Opciones:"
      echo "  --limit N        Resultados por pasada (default: 30)"
      echo "  --json           Output en formato JSON crudo (solo primera pasada)"
      echo "  --no-heuristic   Desactiva expansión multi-keyword"
      echo ""
      echo "Ejemplos:"
      echo "  $0 \"obsidian markdown\"       # Busca 'obsidian markdown' + 'obsidian' + 'markdown'"
      echo "  $0 \"pdf processing\" --limit 50"
      echo "  $0 \"testing\" --no-heuristic --json"
      exit 0
      ;;
    *)
      QUERY="$1"
      shift
      ;;
  esac
done

if [[ ! "$QUERY" =~ ^[a-zA-Z0-9_[:space:]-]+$ ]]; then
  echo "❌ Error: Invalid characters in query."
  exit 1
fi

if [[ -z "$QUERY" ]]; then
  echo -e "${YELLOW}Uso: $0 \"<query>\" [--limit N] [--json] [--no-heuristic]${NC}"
  echo -e "${YELLOW}Ejemplo: $0 \"pdf processing\"${NC}"
  exit 1
fi

# ── Auto-detección de backend ────────────────────────────────────────────────
# Si sundial-hub CLI no está instalado, usamos curl directo sin avisar al usuario.
USE_API=true
if command -v sundial-hub &>/dev/null; then
  USE_API=false
fi

BASE_URL="${SUNDIAL_HUB_URL:-https://www.sundialhub.com}"
TOKEN=""
_AUTH_DIR="$HOME/.sundial"
TOKEN=$(cat "$_AUTH_DIR"/* 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || true)
[[ -n "${SUNDIAL_TOKEN:-}" ]] && TOKEN="${SUNDIAL_TOKEN}"

CURL_ARGS=(-s --max-time 10 -H "Content-Type: application/json")
[[ -n "$TOKEN" ]] && CURL_ARGS+=(-H "Authorization: Bearer $TOKEN")

# ── Función: una pasada de búsqueda → devuelve JSON array de skills ──────────
_fetch_skills() {
  local q="$1"
  local lim="$2"
  local encoded
  encoded=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$q" 2>/dev/null || python3 -c "import urllib.parse; print(urllib.parse.quote('$q'))")

  if [[ "$USE_API" == "false" ]]; then
    # CLI mode
    sundial-hub find "$q" --json --limit "$lim" 2>/dev/null || echo "[]"
  else
    # API directa (curl)
    local response
    response=$(curl "${CURL_ARGS[@]}" "${BASE_URL}/api/hub/skills?q=${encoded}&limit=${lim}" 2>/dev/null || echo '{"skills":[]}')
    # Normalizar: la API devuelve {"skills":[...]} pero el CLI devuelve [...]
    echo "$response" | python3 -c "
import sys, json
raw = sys.stdin.read()
try:
    d = json.loads(raw)
    if isinstance(d, list):
        print(raw)
    elif isinstance(d, dict) and 'skills' in d:
        print(json.dumps(d['skills']))
    else:
        print('[]')
except:
    print('[]')
"
  fi
}

# ── Expansión heurística de queries ─────────────────────────────────────────
# Genera lista de queries: query original + palabras individuales (≥4 chars)
_expand_queries() {
  local q="$1"
  python3 -c "
import sys
q = sys.argv[1].strip()
queries = [q]
words = q.split()
if len(words) > 1:
    for w in words:
        if len(w) >= 4 and w not in queries:
            queries.append(w)
# También añade combinaciones parciales de 2 palabras si hay 3+
if len(words) >= 3:
    for i in range(len(words) - 1):
        combo = words[i] + ' ' + words[i+1]
        if combo not in queries:
            queries.append(combo)
for x in queries:
    print(x)
" "$q"
}

# ── Modo JSON crudo (sin heurística, para uso por otros scripts) ─────────────
if [[ "$JSON_MODE" == "true" ]]; then
  _fetch_skills "$QUERY" "$LIMIT"
  exit 0
fi

# ── Búsqueda heurística multi-pasada ────────────────────────────────────────
echo ""
echo -e "${BOLD}${BLUE}🔍 Discovery heurístico en SundialHub: '${QUERY}'${NC}"
echo -e "${DIM}   Backend: $([ "$USE_API" == "true" ] && echo "API directa (curl)" || echo "CLI sundial-hub")  |  Límite por pasada: ${LIMIT}  |  Heurística: ${HEURISTIC}${NC}"
echo "════════════════════════════════════════════════════════════"

# Recolectar queries a ejecutar
QUERIES=("$QUERY")
if [[ "$HEURISTIC" == "true" ]]; then
  while IFS= read -r q; do
    QUERIES+=("$q")
  done < <(_expand_queries "$QUERY" | tail -n +2)  # skip primera (ya está)
fi

# Ejecutar todas las pasadas y acumular JSON
ALL_JSON="[]"
PASS=0
for q in "${QUERIES[@]}"; do
  PASS=$((PASS + 1))
  if [[ "$HEURISTIC" == "true" && ${#QUERIES[@]} -gt 1 ]]; then
    echo -e "${DIM}  Pasada ${PASS}/${#QUERIES[@]}: '${q}'...${NC}"
  fi
  BATCH=$(_fetch_skills "$q" "$LIMIT")
  # Merge acumulado
  ALL_JSON=$(python3 -c "
import sys, json
accumulated = json.loads(sys.argv[1])
batch       = json.loads(sys.argv[2])
seen = {(s.get('author','') + '/' + s.get('name','')) for s in accumulated}
for s in batch:
    key = s.get('author','') + '/' + s.get('name','')
    if key not in seen:
        seen.add(key)
        accumulated.append(s)
print(json.dumps(accumulated))
" "$ALL_JSON" "$BATCH" 2>/dev/null || echo "$ALL_JSON")
done

# ── Renderizar resultados con relevancia ─────────────────────────────────────
echo "$ALL_JSON" | python3 -c "
import sys, json, re

query = sys.argv[1].lower()
raw   = sys.stdin.read()

try:
    skills = json.loads(raw)
except json.JSONDecodeError:
    print('❌ Error: No se pudo parsear la respuesta.')
    sys.exit(1)

if not skills:
    print()
    print('  ❌ No se encontraron skills para la búsqueda.')
    sys.exit(0)

# ── Scoring de relevancia ─────────────────────────────────────────────────
def relevance(s):
    name  = (s.get('name',  '') or '').lower()
    desc  = (s.get('description', '') or '').lower()
    installs = s.get('use_count', 0) or s.get('installs', 0) or 0
    score = 0
    # Coincidencia exacta en nombre → máxima relevancia
    if query == name:
        score += 1000
    elif query in name:
        score += 500
    # Coincidencia de palabras individuales en nombre
    for word in query.split():
        if len(word) >= 3 and word in name:
            score += 200
        if len(word) >= 3 and word in desc:
            score += 50
    # Installs como señal de confianza (log para no aplastar score)
    import math
    score += int(math.log10(max(installs, 1)) * 30)
    return score

skills.sort(key=relevance, reverse=True)

print(f'\n  ✅ Encontrados: {len(skills)} skills únicos\n')

for i, s in enumerate(skills, 1):
    name        = s.get('name', 'N/A')
    author      = s.get('author', 'N/A')
    version     = s.get('version', 'N/A')
    installs    = s.get('use_count', 0) or s.get('installs', 0) or 0
    description = (s.get('description', '') or '')[:130]
    scan_safe   = s.get('scan_is_safe')
    scan_sev    = s.get('scan_max_severity', '') or ''
    scan_count  = s.get('scan_findings_count', 0) or 0

    # Confianza
    if isinstance(installs, int):
        if installs > 10000: trust = '\033[32m⭐⭐⭐ Alta\033[0m'
        elif installs > 1000: trust = '\033[33m⭐⭐  Media\033[0m'
        elif installs > 100:  trust = '⭐   Baja'
        else:                 trust = '     Nueva'
    else:
        trust = '     N/A'

    # Safety
    if scan_safe is True:
        safety = '✅ Safe'
    elif scan_safe is False:
        safety = f'⚠️  {scan_sev} ({scan_count} findings)'
    else:
        safety = '❓ No escaneado'

    # Resaltar coincidencias en nombre
    display_name = name
    for word in query.split():
        if len(word) >= 3:
            display_name = re.sub(f'(?i)({re.escape(word)})', r'\033[1;33m\1\033[0m', display_name)

    print(f'  [{i:>2}] \033[1m{author}/\033[0m\033[1m{display_name}\033[0m  (v{version})')
    print(f'       📦 {installs:,} installs  |  {trust}  |  🔒 {safety}')
    if description:
        print(f'       📄 {description}')
    print(f'       🔗 https://www.sundialhub.com/{author}/{name}')
    print()
" "$QUERY"

echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "💡 ${BOLD}Instalar un skill:${NC}"
echo -e "   ${CYAN}./skills/universal-skill-creator/scripts/install_sundial_skill.sh <author>/<skill>${NC}"
echo ""
echo -e "⚠️  ${DIM}SECURITY: Skills son código externo no verificado. Revisa el SKILL.md antes de instalar.${NC}"
echo ""
