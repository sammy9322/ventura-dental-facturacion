#!/bin/bash
# =============================================================================
# get_time.sh - Obtiene la hora del sistema en múltiples formatos
# Uso: ./get_time.sh [formato]
# Formatos: iso, time, date, datetime, unix, full (default: iso)
# =============================================================================

set -euo pipefail

FORMAT="${1:-iso}"

# Función para obtener offset UTC
get_utc_offset() {
    date +%:z 2>/dev/null || date +%z | sed 's/\(..\)$/:\1/'
}

# Función para obtener timezone
get_timezone() {
    if [ -f /etc/timezone ]; then
        cat /etc/timezone
    elif [ -L /etc/localtime ]; then
        readlink /etc/localtime | sed 's|.*/zoneinfo/||'
    else
        date +%Z
    fi
}

case "$FORMAT" in
    iso)
        date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z | sed 's/\(..\)$/:\1/'
        ;;
    time)
        date +%H:%M:%S
        ;;
    date)
        date +%Y-%m-%d
        ;;
    datetime)
        date +"%Y-%m-%d %H:%M:%S"
        ;;
    unix)
        date +%s
        ;;
    full)
        echo "ISO:      $(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)"
        echo "Date:     $(date +%Y-%m-%d)"
        echo "Time:     $(date +%H:%M:%S)"
        echo "DateTime: $(date +"%Y-%m-%d %H:%M:%S")"
        echo "Unix:     $(date +%s)"
        echo "Timezone: $(get_timezone)"
        echo "UTC Offset: $(get_utc_offset)"
        ;;
    *)
        echo "Error: Formato desconocido '$FORMAT'" >&2
        echo "Formatos válidos: iso, time, date, datetime, unix, full" >&2
        exit 1
        ;;
esac
