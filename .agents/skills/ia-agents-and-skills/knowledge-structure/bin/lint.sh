#!/bin/bash
set -e

SKILL_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")"
WORK_DIR="$(pwd)"
IMAGE_NAME="knowledge-structure:1.0"

# Build image if requested or if not exists
if [[ "$1" == "--build" ]] || ! docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
    echo "Building Docker image $IMAGE_NAME..."
    docker build -t "$IMAGE_NAME" "$SKILL_DIR"
    if [[ "$1" == "--build" ]]; then
        exit 0
    fi
fi

TARGET_DIR=${1:-docs}

# Check if we should prefer local execution
PREFER_LOCAL=false
if command -v node >/dev/null 2>&1 && [ -d "$SKILL_DIR/node_modules" ]; then
    PREFER_LOCAL=true
fi

# Detect Interactive Mode
INTERACTIVE=false
if [ -t 0 ]; then
    INTERACTIVE=true
fi

if [ "$PREFER_LOCAL" = true ]; then
    echo "Local Node.js environment detected. Running natively..."
    node "$SKILL_DIR/src/lint.js" "$1"
else
    # Fallback to Docker
    if [ "$INTERACTIVE" = true ] && [ ! -d "$SKILL_DIR/node_modules" ]; then
        echo "--------------------------------------------------------"
        echo "WARNING: Local dependencies not found in $SKILL_DIR."
        echo "Running via Docker. To run locally:"
        echo "  cd $SKILL_DIR && npm install"
        echo "--------------------------------------------------------"
        sleep 2
    fi

    echo "Running via Docker image: $IMAGE_NAME"
    docker run --rm \
        --volume "$WORK_DIR:/app/work" \
        --user "$(id -u):$(id -g)" \
        "$IMAGE_NAME" \
        node src/lint.js "/app/work/$TARGET_DIR"
fi

echo "Done."
