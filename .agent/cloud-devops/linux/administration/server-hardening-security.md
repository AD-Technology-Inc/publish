# Skill: .agent/cloud-devops/linux/administration/server-hardening-security.md

## 📌 Core Philosophy & Constraints
- **SSH Hardening**: Disable password authentication (`PasswordAuthentication no`) and root login (`PermitRootLogin no`).
- **Firewall Scoping (UFW)**: Deny all incoming traffic by default (`ufw default deny incoming`); allow only 22, 80, 443.
- **Fail2ban Protection**: Configure Fail2ban to ban IP addresses after repeated failed SSH authentication attempts.

## ⚡ Production Boilerplate / Standard Pattern

```bash
# /etc/ssh/sshd_config.d/hardening.conf
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
X11Forwarding no

# UFW Firewall Setup Commands
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH Access'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

# Fail2ban SSH Jail Configuration (/etc/fail2ban/jail.local)
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 600
bantime = 3600
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Password Authentication Enabled**: Leaving `PasswordAuthentication yes` exposing servers to SSH brute-force attacks.
- ❌ **Direct Root Access**: Allowing direct SSH logins as `root` user instead of unprivileged user with `sudo`.
- ❌ **Disabled Firewall**: Disabling UFW/iptables leaving unused service ports open to network scans.

## 🔍 Verification & Testing
- **SSH Auth Test**: Attempt password SSH login `ssh -o PreferredAuthentications=password user@server` asserting `Permission denied`.
