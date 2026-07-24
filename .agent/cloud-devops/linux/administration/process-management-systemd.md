# Skill: .agent/cloud-devops/linux/administration/process-management-systemd.md

## 📌 Core Philosophy & Constraints
- **Systemd Unit Management**: Run application services via Systemd unit files (`/etc/systemd/system/app.service`).
- **Auto-Restart Policies**: Configure `Restart=always` and `RestartSec=5s` for automatic recovery from process crashes.
- **Environment File Injection**: Inject runtime configuration via `EnvironmentFile=/etc/default/app.env`.

## ⚡ Production Boilerplate / Standard Pattern

```ini
# /etc/systemd/system/fastapi-backend.service
[Unit]
Description=FastAPI Backend Service
After=network.target postgresql.service redis.service
Wants=postgresql.service redis.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/app
EnvironmentFile=/var/www/app/.env
ExecStart=/var/www/app/.venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000
Restart=always
RestartSec=5s
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

```bash
# Management Commands
sudo systemctl daemon-reload
sudo systemctl enable --now fastapi-backend
sudo systemctl status fastapi-backend
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Un-managed Background Processes**: Running processes in background terminals using `nohup python app.py &` or `screen`.
- ❌ **Running Systemd Services as Root**: Omitting `User=www-data` running services with elevated root access.
- ❌ **Hardcoded Environment Secrets in Unit Files**: Embedding plain-text passwords directly in `.service` files.

## 🔍 Verification & Testing
- **Status Assertion**: Execute `systemctl status fastapi-backend` verifying output displays `active (running)`.
