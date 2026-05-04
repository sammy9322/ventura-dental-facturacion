#!/bin/bash
# scripts/detect_env.sh
# Detección robusta de entorno para OS Awareness
# Basado en patrones de: thebushidocollective/han@shell-portability

detect_os() {
    if [ -f /etc/os-release ]; then
        # Linux modern
        . /etc/os-release
        echo "$ID"
    elif command -v sw_vers >/dev/null 2>&1; then
        # macOS
        echo "macos"
    else
        # Fallback uname
        case "$(uname -s)" in
            Linux*)     echo "linux-generic" ;;
            Darwin*)    echo "macos" ;;
            MINGW*|CYGWIN*|MSYS*) echo "windows" ;;
            FreeBSD*)   echo "freebsd" ;;
            *)          echo "unknown" ;;
        esac
    fi
}

detect_arch() {
    case "$(uname -m)" in
        x86_64|amd64) echo "amd64" ;;
        aarch64|arm64) echo "arm64" ;;
        armv7l)       echo "arm" ;;
        *)            echo "unknown" ;;
    esac
}

OS=$(detect_os)
ARCH=$(detect_arch)
echo "OS: $OS"
echo "ARCH: $ARCH"

# Sugerencia de gestor
case "$OS" in
    ubuntu|debian|kali) echo "MANAGER: apt" ;;
    fedora|centos|rhel) echo "MANAGER: dnf" ;;
    alpine)             echo "MANAGER: apk" ;;
    macos)              echo "MANAGER: brew" ;;
    *)                  echo "MANAGER: unknown" ;;
esac
