# Skill: .agent/cloud-devops/linux/SKILL.md

# Linux System Administration & Operations Skill Registry

This document serves as the decision matrix and tool reference for AI agents performing Linux server administration, process management, security hardening, and file manipulation tasks.

---

## 🔗 Sub-Skill Deep Dive References
- 🛡️ **Server Hardening & Security**: [server-hardening-security.md](./administration/server-hardening-security.md)
- ⚙️ **Process Management & Systemd**: [process-management-systemd.md](./administration/process-management-systemd.md)
- 🔒 **Storage & Permissions**: [storage-and-permissions.md](./administration/storage-and-permissions.md)
- 📜 **Logrotate & Journald**: [logrotate-and-journald.md](./monitoring-and-maintenance/logrotate-and-journald.md)
- 🤖 **Shell Script Automation**: [shell-scripting-automation.md](./monitoring-and-maintenance/shell-scripting-automation.md)

---

## 🧭 1. Linux Operations Matrix

| Task / Domain | Primary Tool / Command | Context / Usage Rule |
| :--- | :--- | :--- |
| **Search Text (Code/Logs)** | `ripgrep` (`rg`), `grep` | Use `rg "pattern" dir/` for speed; use `grep -rn "pattern" /path/` for system logs/configs. |
| **Search Files / Paths** | `fd`, `find` | Use `fd "filename"` or `find /path -name "*.ext"` to locate configs or logs. |
| **Automated Text Edit** | `sed`, `awk` | Use `sed -i 's/OLD/NEW/g' file` for in-place programmatic file updates. |
| **Manual Text Edit** | `nano`, `vim` | Interactive text editing for terminal sessions. |
| **Process Management** | `systemctl`, `journalctl` | Manage background services, auto-restarts, and live service log streaming. |
| **Process Inspection** | `ps aux`, `htop`, `ss` | Monitor running processes, CPU/RAM usage, and open listening sockets (`ss -tulpn`). |
| **Permissions & Users** | `chmod`, `chown`, `useradd` | Enforce strict permissions (`600` for `.env`, `755` for executable scripts/directories). |
| **Firewall & Security** | `ufw`, `fail2ban` | Default-deny inbound traffic; allow explicitly on ports 22, 80, and 443. |
| **Log Management** | `logrotate`, `journalctl` | Cap log file sizes and auto-rotate to prevent disk exhaustion. |

---

## 🛠️ 2. Linux CRUD Command Cheat Sheet

### 📁 Files & Directories
- **Create:** `touch file.txt`, `mkdir -p /path/to/dir`
- **Read:** `cat file.txt`, `less file.txt`, `tail -f /var/log/syslog`
- **Update:** `sed -i 's/key=old/key=new/g' config.env`, `echo "KEY=VAL" >> config.env`
- **Delete:** `rm file.txt`, `rm -rf /path/to/dir` (Verify path with `pwd` first!)

### ⚙️ Systemd Services
- **Status:** `systemctl status service_name`
- **Logs:** `journalctl -u service_name -n 100 -f`
- **Restart / Reload:** `sudo systemctl restart service_name` or `sudo systemctl daemon-reload`
- **Enable on Boot:** `sudo systemctl enable service_name`

### 🔑 Permissions & Security
- **Secure File (.env / Private Keys):** `chmod 600 /path/to/.env`
- **Set Ownership:** `chown -R appuser:appgroup /var/www/app`
- **Check Open Ports:** `ss -tulpn`
- **Check Firewall Status:** `sudo ufw status verbose`

---

## 🚫 Forbidden Anti-Patterns
- ❌ **NO `chmod 777`:** Never grant full read/write/execute permissions to all users.
- ❌ **NO Root SSH / Password Auth:** Always require SSH keys (`PermitRootLogin no`, `PasswordAuthentication no`).
- ❌ **NO Hardcoded Secrets in Unit Files:** Load credentials using `EnvironmentFile=/path/to/.env` in systemd.
- ❌ **NO Unbounded Logs:** Always configure `logrotate` or journal limits for custom service logging.