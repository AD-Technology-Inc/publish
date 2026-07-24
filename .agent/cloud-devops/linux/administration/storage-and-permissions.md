# Skill: .agent/cloud-devops/linux/administration/storage-and-permissions.md

## 📌 Core Philosophy & Constraints
- **Strict Permission Masking**: Set directory permissions to `750` (`rwxr-x---`) and file permissions to `640` (`rw-r-----`).
- **Least Privilege Ownership**: Assign ownership strictly to service users (`www-data:www-data`), never global `root`.
- **Disk Space Analysis**: Monitor filesystem usage using `df -h` and `du -sh *` to prevent out-of-space crashes.

## ⚡ Production Boilerplate / Standard Pattern

```bash
# Set secure application file ownership and permission boundaries
sudo chown -R www-data:www-data /var/www/app

# Set directory permissions to 750
find /var/www/app -type d -exec chmod 750 {} +

# Set file permissions to 640
find /var/www/app -type f -exec chmod 640 {} +

# Make virtualenv binaries executable
chmod -R +x /var/www/app/.venv/bin

# Disk Usage Inspection Commands
df -hT /var
du -sh /var/log/* | sort -hr | head -n 10
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Permissive Permission Masks**: Executing `chmod -R 777 /var/www` granting world-writable permissions to all local processes.
- ❌ **Root File Ownership**: Leaving application uploads owned by `root:root` preventing service user access.
- ❌ **Ignoring Full Filesystems**: Allowing log or tmp directories to reach 100% capacity causing service failure.

## 🔍 Verification & Testing
- **Permission Verification**: Execute `ls -ld /var/www/app` verifying permissions output `drwxr-x--- www-data www-data`.
