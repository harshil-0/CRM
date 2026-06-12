#!/bin/bash
# CRM Database Backup Script
# Usage: ./backup.sh [backup_dir]
# Cron: 0 2 * * * /opt/crm/docker/backup.sh /opt/crm/backups

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER="${POSTGRES_CONTAINER:-crm-postgres}"
DB_USER="${POSTGRES_USER:-crm}"
DB_NAME="${POSTGRES_DB:-crm_dev}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup of $DB_NAME..."

docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom \
  > "$BACKUP_DIR/crm_${DB_NAME}_${TIMESTAMP}.dump"

gzip "$BACKUP_DIR/crm_${DB_NAME}_${TIMESTAMP}.dump"

echo "[$(date)] Backup saved: $BACKUP_DIR/crm_${DB_NAME}_${TIMESTAMP}.dump.gz"

find "$BACKUP_DIR" -name "crm_*.dump.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Cleaned backups older than $RETENTION_DAYS days"
