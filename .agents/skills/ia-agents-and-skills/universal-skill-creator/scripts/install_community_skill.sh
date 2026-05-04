#!/usr/bin/env bash
set -euo pipefail

# Interactively ask for confirmation before installation (LLM_PROMPT_INJECTION mitigation)
echo "==========================================="
echo "=== SECURITY SANDBOX REVIEW ==="
echo "⚠️ WARNING: You are attempting to download instructions/tools from $1."
echo "Remote skills can contain indirect prompt injection or unintended commands."
echo "Please manually review the skill source repository before continuing."
echo -n "Do you approve installing this remote code to your LOCAL project only? (y/N): "
read confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Installation aborted by user for security reasons."
  exit 1
fi

usage() {
  echo "Uso: $0 <repo> <skill-name>"
  echo "  repo        Repositorio en formato owner/repo (ej: anthropics/skills)"
  echo "  skill-name  Nombre del skill a instalar (ej: pdf)"
  exit 1
}

if [[ $# -lt 2 ]]; then
  usage
fi

REPO=$1
SKILL=$2

# Input validation for command injection prevention
if [[ ! "$REPO" =~ ^[a-zA-Z0-9_/-]+$ ]] || [[ ! "$SKILL" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo "❌ Error: Invalid characters in identifier. Possible injection detected."
  exit 1
fi

echo "📦 Instalando skill '$SKILL' desde '$REPO' de forma LOCAL (Restricted)..."

# SECURITY: Executes local constrained command for project-only install
skills add "$REPO" --skill "$SKILL" -a antigravity --cwd ./skills -y

echo "✅ Skill '$SKILL' instalado localmente."
