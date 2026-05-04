#!/usr/bin/env bash
set -euo pipefail

echo "==========================================="
echo "=== SECURITY SANDBOX REVIEW ==="
echo "⚠️ WARNING: You are attempting to download a skill from SundialHub ($1)."
echo "Remote skills can contain indirect prompt injection or unintended commands."
echo "Please manually review the skill manifest before executing any allowed tools."
echo -n "Do you approve installing this remote code to your LOCAL project only? (y/N): "
read confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Installation aborted by user for security reasons."
  exit 1
fi

# Input validation
if [[ ! "$1" =~ ^[a-zA-Z0-9_/-]+$ ]]; then
  echo "❌ Error: Invalid characters in identifier. Possible injection detected."
  exit 1
fi

echo "📦 Instalando skill '$1' de forma LOCAL (Restricted)..."

sundial-hub add "$1"

echo "✅ Skill '$1' instalado localmente."
