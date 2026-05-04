#!/usr/bin/env bash
set -euo pipefail
# ==============================================================================
# scan_sensitive_data.sh
# Escanea un directorio de skill en busca de información sensible antes de
# publicar a SundialHub u otro registry.
#
# OBLIGATORIO: Debe ejecutarse antes de cualquier operación de push/publish.
#
# Uso: ./scan_sensitive_data.sh [ruta-skill] [--strict] [--json]
# Exit codes:
#   0 = Limpio, no se encontraron hallazgos
#   1 = Se encontraron hallazgos (BLOQUEANTE)
#   2 = Error de uso/parámetros
# ==============================================================================

set -e

# ── Colores ──────────────────────────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# ── Variables ────────────────────────────────────────────────────────────────
SKILL_PATH="."
STRICT_MODE=false
JSON_MODE=false
FINDINGS=()
FINDING_COUNT=0
CRITICAL_COUNT=0

usage() {
  echo "Uso: $0 [ruta-skill] [--strict] [--json]"
  echo ""
  echo "Escanea un directorio de skill en busca de información sensible."
  echo ""
  echo "Opciones:"
  echo "  ruta-skill   Ruta al directorio del skill (default: .)"
  echo "  --strict     Falla también con warnings (no solo con errores)"
  echo "  --json       Output en formato JSON (para uso programático)"
  echo ""
  echo "Exit codes:"
  echo "  0 = Limpio"
  echo "  1 = Hallazgos encontrados (BLOQUEANTE)"
  echo "  2 = Error de uso"
  echo ""
  echo "Ejemplos:"
  echo "  $0 ./skills/my-skill"
  echo "  $0 ./skills/my-skill --strict"
  echo "  $0 --json"
  exit 2
}

# Parsear argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    --strict)
      STRICT_MODE=true
      shift
      ;;
    --json)
      JSON_MODE=true
      shift
      ;;
    -h|--help)
      usage
      ;;
    *)
      if [[ "$1" != --* ]]; then
        SKILL_PATH="$1"
      fi
      shift
      ;;
  esac
done

# Verificar directorio
if [[ ! -d "$SKILL_PATH" ]]; then
  echo -e "${RED}❌ Error: El directorio '$SKILL_PATH' no existe.${NC}" >&2
  exit 2
fi

# ── Funciones de reporte ─────────────────────────────────────────────────────
add_finding() {
  local severity="$1"   # CRITICAL, HIGH, MEDIUM, LOW
  local file="$2"
  local line_num="$3"
  local category="$4"
  local description="$5"
  local match="$6"

  FINDING_COUNT=$((FINDING_COUNT + 1))

  if [[ "$severity" == "CRITICAL" || "$severity" == "HIGH" ]]; then
    CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
  fi

  if [[ "$JSON_MODE" == "true" ]]; then
    # Escapar comillas en match para JSON
    local escaped_match
    escaped_match=$(echo "$match" | sed 's/"/\\"/g' | head -c 200)
    FINDINGS+=("{\"severity\":\"$severity\",\"file\":\"$file\",\"line\":$line_num,\"category\":\"$category\",\"description\":\"$description\",\"match\":\"$escaped_match\"}")
  else
    local color="$YELLOW"
    local icon="⚠"
    case "$severity" in
      CRITICAL) color="$RED"; icon="🚨" ;;
      HIGH)     color="$RED"; icon="❌" ;;
      MEDIUM)   color="$YELLOW"; icon="⚠️" ;;
      LOW)      color="$CYAN"; icon="ℹ️" ;;
    esac
    echo -e "  ${color}${icon} [${severity}] ${file}:${line_num}${NC}"
    echo -e "     ${BOLD}${category}:${NC} ${description}"
    if [[ -n "$match" ]]; then
      # Truncar match a 120 chars y ocultar parcialmente
      local display_match
      display_match=$(echo "$match" | head -c 120 | sed 's/[a-zA-Z0-9]\{4\}$/****/g')
      echo -e "     Match: ${MAGENTA}${display_match}...${NC}"
    fi
    echo ""
  fi
}

# ── Funciones de escaneo ─────────────────────────────────────────────────────

# Archivos a excluir del escaneo (binarios, lock files, etc.)
SKIP_PATTERN='\.git/|node_modules/|\.DS_Store|__pycache__|\.pyc$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.ico$|\.woff|\.ttf|\.eot|\.svg$|package-lock\.json|yarn\.lock|pnpm-lock'

# Obtener lista de archivos a escanear
get_files() {
  find "$SKILL_PATH" -type f 2>/dev/null | grep -v -E "$SKIP_PATTERN" || true
}

# ── Regla 1: Tokens y API Keys ──────────────────────────────────────────────
scan_tokens_and_keys() {
  local files
  files=$(get_files)
  [[ -z "$files" ]] && return

  while IFS= read -r file; do
    # Prefijos de tokens conocidos
    while IFS=: read -r line_num match; do
      [[ -z "$match" ]] && continue
      add_finding "CRITICAL" "$file" "$line_num" "API_TOKEN" \
        "Token de API detectado (prefijo conocido)" "$match"
    done < <(grep -n -E '(sd_[a-zA-Z0-9]{20,}|sk-[a-zA-Z0-9]{20,}|sk-proj-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|gho_[a-zA-Z0-9]{20,}|ghs_[a-zA-Z0-9]{20,}|glpat-[a-zA-Z0-9-]{20,}|xoxb-[a-zA-Z0-9-]+|xoxp-[a-zA-Z0-9-]+|AKIA[A-Z0-9]{16}|AIza[a-zA-Z0-9_-]{35}|ya29\.[a-zA-Z0-9_-]+|eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]+)' "$file" 2>/dev/null || true)

    # Patrones genéricos de asignación de tokens/keys
    while IFS=: read -r line_num match; do
      [[ -z "$match" ]] && continue
      # Filtrar falsos positivos de templates/documentación
      if echo "$match" | grep -qE '(YOUR_|REPLACE_|<.*>|\$\{|example|placeholder|xxx)'; then
        continue
      fi
      add_finding "HIGH" "$file" "$line_num" "API_KEY_GENERIC" \
        "Posible API key o secret en asignación" "$match"
    done < <(grep -n -iE '(api[_-]?key|api[_-]?secret|api[_-]?token|access[_-]?token|auth[_-]?token|bearer[_-]?token|secret[_-]?key|private[_-]?key|client[_-]?secret)\s*[:=]\s*["\x27]?[a-zA-Z0-9_/+=-]{10,}' "$file" 2>/dev/null || true)

  done <<< "$files"
}

# ── Regla 2: Passwords y Credenciales ────────────────────────────────────────
scan_passwords() {
  local files
  files=$(get_files)
  [[ -z "$files" ]] && return

  while IFS= read -r file; do
    while IFS=: read -r line_num match; do
      [[ -z "$match" ]] && continue
      # Filtrar placeholders
      if echo "$match" | grep -qiE '(YOUR_|REPLACE_|<.*>|\$\{|example|changeme|password123|xxxx)'; then
        continue
      fi
      add_finding "CRITICAL" "$file" "$line_num" "PASSWORD" \
        "Posible password hardcodeada" "$match"
    done < <(grep -n -iE '(password|passwd|pwd)\s*[:=]\s*["\x27][^"\x27]{4,}["\x27]' "$file" 2>/dev/null || true)

    # Connection strings con credenciales embebidas
    while IFS=: read -r line_num match; do
      [[ -z "$match" ]] && continue
      add_finding "CRITICAL" "$file" "$line_num" "CONNECTION_STRING" \
        "Connection string con credenciales embebidas" "$match"
    done < <(grep -n -iE '(mongodb|postgres|mysql|redis|amqp|mssql)://[a-zA-Z0-9_]+:[^@]+@' "$file" 2>/dev/null || true)

  done <<< "$files"
}

# ── Regla 3: Archivos sensibles ──────────────────────────────────────────────
scan_sensitive_files() {
  local files
  files=$(get_files)
  [[ -z "$files" ]] && return

  while IFS= read -r file; do
    local basename
    basename=$(basename "$file")
    local rel_path="${file#$SKILL_PATH/}"

    case "$basename" in
      .env|.env.local|.env.production|.env.staging|.env.development)
        add_finding "CRITICAL" "$rel_path" 0 "ENV_FILE" \
          "Archivo .env con posibles variables sensibles" ""
        ;;
      id_rsa|id_ed25519|id_ecdsa|*.pem|*.key|*.p12|*.pfx|*.jks)
        add_finding "CRITICAL" "$rel_path" 0 "PRIVATE_KEY_FILE" \
          "Archivo de clave privada detectado" ""
        ;;
      .htpasswd|.htaccess|shadow|passwd)
        add_finding "HIGH" "$rel_path" 0 "AUTH_FILE" \
          "Archivo de autenticación del sistema detectado" ""
        ;;
      credentials|credentials.json|service-account*.json|*-credentials.json)
        add_finding "CRITICAL" "$rel_path" 0 "CREDENTIALS_FILE" \
          "Archivo de credenciales detectado" ""
        ;;
      *.sqlite|*.db|*.sqlite3)
        add_finding "MEDIUM" "$rel_path" 0 "DATABASE_FILE" \
          "Archivo de base de datos detectado (puede contener datos sensibles)" ""
        ;;
      auth_config_file)
        add_finding "CRITICAL" "$rel_path" 0 "AUTH_CONFIG" \
          "Archivo auth_config_file detectado (puede contener tokens)" ""
        ;;
    esac
  done <<< "$files"
}

# ── Regla 4: IPs privadas y URLs internas ────────────────────────────────────
scan_internal_network() {
  local files
  files=$(get_files)
  [[ -z "$files" ]] && return

  while IFS= read -r file; do
    # IPs privadas (RFC 1918)
    while IFS=: read -r line_num match; do
      [[ -z "$match" ]] && continue
      # Filtrar versiones semánticas comunes (ej: 10.0.0 en semver) y loopback
      if echo "$match" | grep -qE '(version|v[0-9]|semver|127\.0\.0\.1|localhost|0\.0\.0\.0)'; then
        continue
      fi
      add_finding "MEDIUM" "$file" "$line_num" "PRIVATE_IP" \
        "IP de red privada detectada" "$match"
    done < <(grep -n -E '(10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3}|192\.168\.[0-9]{1,3}\.[0-9]{1,3})' "$file" 2>/dev/null || true)

    # URLs internas/locales
    while IFS=: read -r line_num match; do
      [[ -z "$match" ]] && continue
      add_finding "MEDIUM" "$file" "$line_num" "INTERNAL_URL" \
        "URL interna/local detectada" "$match"
    done < <(grep -n -iE 'https?://(localhost|127\.0\.0\.1|internal\.|intranet\.|staging\.|dev\.)' "$file" 2>/dev/null || true)

  done <<< "$files"
}

# ── Regla 5: Emails y datos personales ────────────────────────────────────────
scan_personal_data() {
  local files
  files=$(get_files)
  [[ -z "$files" ]] && return

  while IFS= read -r file; do
    # Emails personales (no de empresas genéricas)
    while IFS=: read -r line_num match; do
      [[ -z "$match" ]] && continue
      # Filtrar emails genéricos/documentación
      if echo "$match" | grep -qiE '(example\.com|test\.com|placeholder|user@|admin@example|noreply|support@)'; then
        continue
      fi
      add_finding "LOW" "$file" "$line_num" "EMAIL" \
        "Dirección de email detectada" "$match"
    done < <(grep -n -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' "$file" 2>/dev/null || true)

  done <<< "$files"
}

# ── Regla 6: Claves privadas embebidas ────────────────────────────────────────
scan_embedded_keys() {
  local files
  files=$(get_files)
  [[ -z "$files" ]] && return

  while IFS= read -r file; do
    while IFS=: read -r line_num match; do
      [[ -z "$match" ]] && continue
      add_finding "CRITICAL" "$file" "$line_num" "EMBEDDED_KEY" \
        "Clave privada embebida en código" "$match"
    done < <(grep -n -E "(-{5}BEGIN (RSA |EC |DSA |OPENSSH )?P""RIVATE K""EY-{5}|-{5}BEGIN CERTIFICATE-{5})" "$file" 2>/dev/null || true)

  done <<< "$files"
}

# ── Regla 7: Variables de entorno hardcodeadas ────────────────────────────────
scan_hardcoded_env_vars() {
  local files
  files=$(get_files)
  [[ -z "$files" ]] && return

  while IFS= read -r file; do
    # Solo buscar en scripts y código, no en documentación
    case "$file" in
      *.md|*.txt|*.rst|*.html) continue ;;
    esac

    while IFS=: read -r line_num match; do
      [[ -z "$match" ]] && continue
      # Filtrar si el valor es un placeholder
      if echo "$match" | grep -qiE '(YOUR_|REPLACE_|<.*>|\$\{|TODO|FIXME|example|undefined|null|empty|none)'; then
        continue
      fi
      add_finding "HIGH" "$file" "$line_num" "HARDCODED_ENV" \
        "Variable de entorno sensible con valor hardcodeado" "$match"
    done < <(grep -n -iE '(AWS_SECRET|DATABASE_URL|DB_PASSWORD|PRIVATE_KEY|JWT_SECRET|ENCRYPTION_KEY|SENDGRID_KEY|STRIPE_KEY|TWILIO_|FIREBASE_)\s*[:=]\s*["\x27]?[a-zA-Z0-9_/+=-]{8,}' "$file" 2>/dev/null || true)

  done <<< "$files"
}

# ══════════════════════════════════════════════════════════════════════════════
# EJECUCIÓN PRINCIPAL
# ══════════════════════════════════════════════════════════════════════════════

if [[ "$JSON_MODE" != "true" ]]; then
  echo ""
  echo -e "${BOLD}${BLUE}🔒 Escaneando información sensible${NC}"
  echo -e "   Directorio: ${CYAN}${SKILL_PATH}${NC}"
  echo "════════════════════════════════════════════════════════════"
  echo ""
fi

# Ejecutar todas las reglas
scan_tokens_and_keys
scan_passwords
scan_sensitive_files
scan_internal_network
scan_personal_data
scan_embedded_keys
scan_hardcoded_env_vars

# ── Reporte final ────────────────────────────────────────────────────────────

if [[ "$JSON_MODE" == "true" ]]; then
  # Output JSON
  echo "{"
  echo "  \"scan_path\": \"$SKILL_PATH\","
  echo "  \"total_findings\": $FINDING_COUNT,"
  echo "  \"critical_findings\": $CRITICAL_COUNT,"
  echo "  \"is_safe\": $([ $FINDING_COUNT -eq 0 ] && echo "true" || echo "false"),"
  echo "  \"findings\": ["
  local first=true
  for i in "${!FINDINGS[@]}"; do
    if [[ "$first" == "true" ]]; then
      first=false
    else
      echo ","
    fi
    echo -n "    ${FINDINGS[$i]}"
  done
  echo ""
  echo "  ]"
  echo "}"
else
  echo "════════════════════════════════════════════════════════════"

  if [[ $FINDING_COUNT -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}✅ LIMPIO — No se encontró información sensible${NC}"
    echo -e "   El skill es seguro para publicar."
  else
    echo -e "${BOLD}📊 Resumen del escaneo:${NC}"
    echo -e "   Total hallazgos: ${BOLD}${FINDING_COUNT}${NC}"
    echo -e "   Críticos/Altos:  ${RED}${BOLD}${CRITICAL_COUNT}${NC}"
    echo ""

    if [[ $CRITICAL_COUNT -gt 0 ]]; then
      echo -e "${RED}${BOLD}🚨 BLOQUEADO — ${CRITICAL_COUNT} hallazgo(s) CRITICAL/HIGH encontrado(s)${NC}"
      echo -e "   ${RED}NO publicar este skill hasta corregir los hallazgos marcados.${NC}"
      echo ""
      echo -e "   💡 ${BOLD}Acciones recomendadas:${NC}"
      echo -e "      1. Eliminar tokens, passwords y claves privadas del código"
      echo -e "      2. Usar variables de entorno (\$ENV_VAR) en vez de valores hardcodeados"
      echo -e "      3. Agregar archivos sensibles a .gitignore"
      echo -e "      4. Rotar cualquier credencial que haya sido expuesta"
      echo -e "      5. Re-ejecutar este scan hasta obtener 0 hallazgos"
    else
      echo -e "${YELLOW}${BOLD}⚠ ADVERTENCIA — ${FINDING_COUNT} hallazgo(s) de severidad media/baja${NC}"
      if [[ "$STRICT_MODE" == "true" ]]; then
        echo -e "   ${RED}Modo --strict activado: Falla con cualquier hallazgo.${NC}"
      else
        echo -e "   Revisa manualmente antes de publicar."
        echo -e "   Usa ${CYAN}--strict${NC} para bloquear también estos."
      fi
    fi
  fi
  echo ""
fi

# ── Exit code ────────────────────────────────────────────────────────────────
if [[ $CRITICAL_COUNT -gt 0 ]]; then
  exit 1
fi

if [[ "$STRICT_MODE" == "true" && $FINDING_COUNT -gt 0 ]]; then
  exit 1
fi

exit 0
