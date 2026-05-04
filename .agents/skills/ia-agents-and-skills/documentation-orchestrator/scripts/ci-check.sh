#!/bin/bash
set -e

# This script runs the full documentation pipeline:
# 1. Linting (knowledge-structure)
# 2. Building (docs-renderer)

SKILL_ROOT="$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")"
DOCS_DIR=${1:-docs}
OUTPUT_FILE=${2:-docs/manual.pdf}

echo "========================================"
echo "   Documentation Orchestrator: CI Check"
echo "========================================"

# Step 1: Lint
echo "[1/2] Linting..."
$SKILL_ROOT/knowledge-structure/bin/lint.sh "$DOCS_DIR"

# Step 2: Build
echo "[2/2] Building PDF..."
$SKILL_ROOT/docs-renderer/bin/run.sh "$DOCS_DIR/index.md" "$OUTPUT_FILE" --theme modern

echo "========================================"
echo "   CI Check Passed! Artifact: $OUTPUT_FILE"
echo "========================================"
