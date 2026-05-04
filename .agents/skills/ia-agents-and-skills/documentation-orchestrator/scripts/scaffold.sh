#!/bin/bash
set -e
# Delegate to knowledge-structure
SKILL_ROOT="$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")"
$SKILL_ROOT/knowledge-structure/bin/scaffold.sh "$@"
