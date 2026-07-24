# Skill: .agent/cloud-devops/linux/monitoring-and-maintenance/shell-scripting-automation.md

## 📌 Core Philosophy & Constraints
- **Strict Shell Mode**: All Bash scripts MUST start with `set -euo pipefail` to fail immediately on unhandled errors.
- **Idempotent Automation**: Ensure automation scripts can be re-run safely multiple times without side effects.
- **Crontab Logging**: Redirect cron job stdout and stderr output to log files or monitoring services.

## ⚡ Production Boilerplate / Standard Pattern

```bash
#!/usr/bin/env bash
set -euo pipefail

# Production Backup Automation Script
BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"

echo "🚀 Starting automated database backup at $(date)..."
mkdir -p "${BACKUP_DIR}"

# Execute PostgreSQL Dump & Compress
PGPASSWORD="${DB_PASSWORD:-postgres}" pg_dump -h localhost -U postgres -d app_db | gzip > "${BACKUP_FILE}"

# Remove backups older than 7 days
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime +7 -delete

echo "✅ Backup successfully created at ${BACKUP_FILE}"
```

```text
# Crontab Entry (/etc/cron.d/db-backup)
0 2 * * * root /usr/local/bin/db-backup.sh >> /var/log/db-backup.log 2>&1
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unchecked Script Execution**: Omitting `set -e` allowing execution to continue after failed commands.
- ❌ **Unquoted Shell Variables**: Writing `$VARIABLE` without double quotes (`"$VARIABLE"`) causing word splitting bugs.
- ❌ **Silent Cron Failure**: Running crontabs without redirecting `2>&1` output to log files.

## 🔍 Verification & Testing
- **Shellcheck Validation**: Execute `shellcheck script.sh` asserting zero linter warnings.
