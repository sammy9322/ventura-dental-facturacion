#!/bin/bash
set -e

SKILL_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")"
WORK_DIR="$(pwd)"
IMAGE_NAME="docs-renderer:2.0"

# Build image if requested or if not exists
if [[ "$1" == "--build" ]] || ! docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
    echo "Building Docker image $IMAGE_NAME..."
    docker build -t "$IMAGE_NAME" "$SKILL_DIR"
    if [[ "$1" == "--build" ]]; then
        exit 0
    fi
fi

# Parse Arguments
FILES=()
FLAGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --theme|--format)
            FLAGS+=("$1" "$2")
            shift 2
            ;;
        *)
            FILES+=("$1")
            shift
            ;;
    esac
done

if [[ ${#FILES[@]} -lt 2 ]]; then
    echo "Usage: $0 <input_file1> [input_file2 ...] <output_file> [--theme name] [--format pdf|html]"
    exit 1
fi

OUTPUT_FILE=${FILES[${#FILES[@]}-1]}
INPUT_FILES=("${FILES[@]:0:${#FILES[@]}-1}")

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
    node "$SKILL_DIR/src/convert.js" "${INPUT_FILES[@]}" "$OUTPUT_FILE" "${FLAGS[@]}"
else
    # Fallback to Docker
    if [ "$INTERACTIVE" = true ] && [ ! -d "$SKILL_DIR/node_modules" ]; then
        echo "--------------------------------------------------------"
        echo "WARNING: Local dependencies not found in $SKILL_DIR."
        echo "Running via Docker (slower startup). To run locally:"
        echo "  cd $SKILL_DIR && npm install"
        echo "--------------------------------------------------------"
        # Optional: Ask user if they want to install now? 
        # For automation, we just proceed with Docker.
        sleep 2
    fi

    echo "Running via Docker image: $IMAGE_NAME"
    
    # Construct Docker Args
    DOCKER_FILE_ARGS=""
    for file in "${INPUT_FILES[@]}"; do
        # If file path is absolute, use it directly if mapped, but here we only map WORK_DIR
        # Better to make paths relative to WORK_DIR if possible, or mounting volumes is tricky if files are outside.
        # Current logic assumes files are in current working dir.
        DOCKER_FILE_ARGS="$DOCKER_FILE_ARGS /app/work/$file"
    done
    DOCKER_FILE_ARGS="$DOCKER_FILE_ARGS /app/work/$OUTPUT_FILE"

    docker run --rm \
        --volume "$WORK_DIR:/app/work" \
        --user "$(id -u):$(id -g)" \
        "$IMAGE_NAME" \
        node /app/src/convert.js $DOCKER_FILE_ARGS "${FLAGS[@]}"
fi

echo "Done."
