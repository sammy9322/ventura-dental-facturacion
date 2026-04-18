#!/bin/bash
# =============================================================================
# Script de Backup para Ventura Dental
# Sistema de Facturación Clínica
# =============================================================================
# Este script crea respaldos del código fuente y la base de datos
# 
# Uso: ./backup.sh [tipo]
# Tipos: 
#   - code   : Solo código fuente
#   - db     : Solo base de datos
#   - all    : Código y base de datos (por defecto)
# =============================================================================

# Configuración
PROJECT_NAME="ventura-dental-facturacion"
PROJECT_DIR="/Users/macbookpro/Documents/Proyecto Laboratorio Daniel /Facturación Clínica"
BACKUP_DIR="$PROJECT_DIR/docs/BACKUPS"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_TYPE="${1:-all}"

# Colores para输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

log_info "=========================================="
log_info "  Ventura Dental - Sistema de Backup"
log_info "=========================================="
log_info "Fecha: $(date)"
log_info "Tipo de backup: $BACKUP_TYPE"
log_info ""

# Función para backup de código
backup_code() {
    log_info "Iniciando backup de código fuente..."
    
    local code_backup="$BACKUP_DIR/${PROJECT_NAME}_code_${TIMESTAMP}.zip"
    
    # Crear archivo zip con el código
    cd "$PROJECT_DIR"
    zip -r "$code_backup" \
        "server/src" \
        "client/src" \
        "server/package.json" \
        "server/tsconfig.json" \
        "server/.env" \
        "client/package.json" \
        "client/tsconfig.json" \
        "client/vite.config.ts" \
        "client/index.html" \
        "README.md" \
        ".gitignore" \
        "docs" \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$code_backup" | cut -f1)
        log_info "Backup de código creado: $(basename $code_backup) ($size)"
        
        # Guardar versión en tags
        local latest_link="$BACKUP_DIR/latest_code.zip"
        rm -f "$latest_link"
        ln -s "$code_backup" "$latest_link"
        
        return 0
    else
        log_error "Error al crear backup de código"
        return 1
    fi
}

# Función para backup de base de datos
backup_db() {
    log_info "Iniciando backup de base de datos..."
    
    local db_backup="$BACKUP_DIR/${PROJECT_NAME}_db_${TIMESTAMP}.sql"
    
    # Exportar base de datos PostgreSQL
    PGPASSWORD='' /Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump \
        -h localhost \
        -U postgres \
        -d ventura_dental \
        > "$db_backup" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$db_backup" | cut -f1)
        log_info "Backup de BD creado: $(basename $db_backup) ($size)"
        
        # Comprimir
        gzip "$db_backup"
        local gz_backup="${db_backup}.gz"
        
        # Guardar versión latest
        local latest_link="$BACKUP_DIR/latest_db.sql.gz"
        rm -f "$latest_link"
        ln -s "$gz_backup" "$latest_link"
        
        return 0
    else
        log_error "Error al crear backup de base de datos"
        return 1
    fi
}

# Ejecutar backups según el tipo
case $BACKUP_TYPE in
    code)
        backup_code
        ;;
    db)
        backup_db
        ;;
    all)
        backup_code
        backup_db
        ;;
    *)
        log_error "Tipo de backup inválido: $BACKUP_TYPE"
        log_info "Usos: ./backup.sh [code|db|all]"
        exit 1
        ;;
esac

# Mostrar resumen
log_info ""
log_info "=========================================="
log_info "  Resumen de Backups"
log_info "=========================================="
ls -lh "$BACKUP_DIR" | grep "$TIMESTAMP" | awk '{print "  " $9 " (" $5 ")"}'

log_info ""
log_info "Backups completados exitosamente!"
log_info "Ubicación: $BACKUP_DIR"

# Mantener solo los últimos 10 backups
log_info "Limpiando backups antiguos (manteniendo los últimos 10)..."
cd "$BACKUP_DIR"
ls -t ${PROJECT_NAME}_* | tail -n +11 | xargs -r rm -f

log_info "Proceso terminado."
