#!/bin/bash
set -e

SKILL_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")"
WORK_DIR="$(pwd)"
IMAGE_NAME="web-screenshot:1.0"

# Build image if requested or if not exists
if [[ "$1" == "--build" ]] || ! docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
    echo "Building Docker image $IMAGE_NAME..."
    docker build -t "$IMAGE_NAME" "$SKILL_DIR"
    if [[ "$1" == "--build" ]]; then
        exit 0
    fi
fi

# Args
INPUT=$1
OUTPUT=$2

if [[ -z "$INPUT" || -z "$OUTPUT" ]]; then
    echo "Usage: $0 <url_or_local_file> <output_image_path>"
    exit 1
fi

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
    
    # Logic for local paths vs URL
    if [[ "$INPUT" == http* ]]; then
        FINAL_INPUT="$INPUT"
    else
        FINAL_INPUT="$WORK_DIR/$INPUT"
    fi
    FINAL_OUTPUT="$WORK_DIR/$OUTPUT"
    
    node "$SKILL_DIR/src/snap.js" "$FINAL_INPUT" "$FINAL_OUTPUT"
else
    # Fallback to Docker
    if [ "$INTERACTIVE" = true ] && [ ! -d "$SKILL_DIR/node_modules" ]; then
        echo "--------------------------------------------------------"
        echo "WARNING: Local dependencies not found in $SKILL_DIR."
        echo "Running via Docker (slower startup). To run locally:"
        echo "  cd $SKILL_DIR && npm install"
        echo "--------------------------------------------------------"
        sleep 2
    fi

    echo "Running via Docker image: $IMAGE_NAME"

    # Helper for docker path mapping
    DOCKER_ARGS=""
    TARGET_URL=""

    if [[ "$INPUT" == http* ]]; then
        TARGET_URL="$INPUT"
    else
        # Local file
        TARGET_URL="/app/work/$INPUT"
    fi

    OUTPUT_PATH="/app/work/$OUTPUT"

    echo "Snapshotting $TARGET_URL -> $OUTPUT..."

    docker run --rm \
        --volume "$WORK_DIR:/app/work" \
        --user "$(id -u):$(id -g)" \
        --network host \
        "$IMAGE_NAME" \
        node /app/src/snap.js "$TARGET_URL" "$OUTPUT_PATH"
fi

echo "Done."
