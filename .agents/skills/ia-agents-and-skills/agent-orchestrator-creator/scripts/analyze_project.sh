#!/usr/bin/env bash
# ==============================================================================
# analyze_project.sh
# Deep Discovery tool for Agent Orchestrator
# Detects stack, existing agents, and suggests topologies.
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Initiating Deep Discovery...${NC}"

# 1. Stack Detection
echo -e "\n${YELLOW}--- Stack Detection ---${NC}"
STACK=""

if [[ -f "package.json" ]]; then
    echo -e "✅ Node.js detected (package.json)"
    STACK+="Node.js "
fi
if [[ -f "requirements.txt" || -f "pyproject.toml" ]]; then
    echo -e "✅ Python detected"
    STACK+="Python "
fi
if [[ -f "docker-compose.yml" ]]; then
    echo -e "✅ Docker detected"
    STACK+="Docker "
fi
if [[ -f "Cargo.toml" ]]; then
    echo -e "✅ Rust detected"
    STACK+="Rust "
fi

if [[ -z "$STACK" ]]; then
    echo "⚠️  No standard stack detected."
else
    echo -e "🎯 Detected Stack: ${GREEN}$STACK${NC}"
fi

# 2. Agent Configuration Check
echo -e "\n${YELLOW}--- Agent Configuration ---${NC}"
if [[ -d ".agent" || -d ".github/agents" ]]; then
    echo -e "⚠️  Existing Agent configuration found:"
    ls -F .agent/ 2>/dev/null || ls -F .github/agents/ 2>/dev/null
else
    echo -e "✅ No conflicting agent configurations found."
fi

# 3. Project Structure Analysis
echo -e "\n${YELLOW}--- Project Structure ---${NC}"
# List top level directories excluding hidden and common ignores
find . -maxdepth 1 -type d -not -path '*/.*' -not -path '.' | sed 's|^\./||'

# 4. Recommendations
echo -e "\n${BLUE}💡 Recommendations:${NC}"
if [[ "$STACK" == *"Node.js"* ]]; then
    echo "- Recommend: Node/React Specialist Agent"
fi
if [[ "$STACK" == *"Python"* ]]; then
    echo "- Recommend: Python/Data Specialist Agent"
fi
echo "- Always: Master Orchestrator for coordination"

echo -e "\n${GREEN}Discovery Complete.${NC}"
