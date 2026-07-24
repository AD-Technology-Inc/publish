# Skill: .agent/cloud-devops/linux/monitoring-and-maintenance/logrotate-and-journald.md

## 📌 Core Philosophy & Constraints
- **Log Rotation Enforcement**: Configure `logrotate` for all custom application log paths to prevent disk capacity failure.
- **Systemd Journal Cleanups**: Cap `journald` log retention size in `/etc/systemd/journald.conf` (`SystemMaxUse=1G`).
- **Structured Journal Filtering**: Query system logs efficiently using `journalctl -u service-name -n 100 --no-pager`.

## ⚡ Production Boilerplate / Standard Pattern

```text
# /etc/logrotate.d/fastapi-app
/var/log/fastapi-app/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload fastapi-backend.service > /dev/null 2>&1 || true
    endscript
}
```

```bash
# journald Configuration Enforcement (/etc/systemd/journald.conf)
[Journal]
SystemMaxUse=1G
SystemKeepFree=2G
MaxRetentionSec=14day

# Log Query Commands
journalctl -u fastapi-backend.service --since "1 hour ago" -p err --no-pager
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Un-rotated Application Logs**: Writing application logs directly to disk without configuring logrotate policies.
- ❌ **Unbounded Journal Logs**: Leaving `SystemMaxUse` uncapped in `journald.conf` allowing `/var/log/journal` to fill disk.
- ❌ **Uncompressed Log Archives**: Keeping multi-gigabyte raw text log files without gzip compression.

## 🔍 Verification & Testing
- **Logrotate Dry-Run**: Execute `sudo logrotate --debug /etc/logrotate.d/fastapi-app` verifying zero syntax errors.
