#!/usr/bin/env bash
# Noor Li Ummi — READ-ONLY VPS inspection.
# This script changes nothing: no installs, no writes outside /tmp, no service restarts.
# Run it yourself on the VPS:   bash inspect-vps.sh > vps-report.txt
# Then share vps-report.txt. Review it first: it prints no passwords or keys,
# but it does list running services, open ports and project folder names.
set -u
section() { printf '\n===== %s =====\n' "$1"; }

section "OS"
cat /etc/os-release 2>/dev/null | grep -E '^(PRETTY_NAME|VERSION_ID)='
uname -r

section "CPU / RAM / DISK"
nproc
free -h
df -h -x tmpfs -x devtmpfs

section "RUNTIMES (versions only)"
for c in docker "docker compose" node npm pnpm python3 psql redis-server nginx caddy git; do
  printf '%-16s ' "$c"; ($c --version 2>/dev/null || $c -v 2>/dev/null || echo "not installed") | head -1
done

section "LISTENING PORTS"
(ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | awk 'NR==1 || /LISTEN/' | sed -E 's/users:\(\(.*//'

section "RUNNING CONTAINERS (names/images/ports only)"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}' 2>/dev/null || echo "docker not available"

section "WEB SERVER SITES (file names only)"
ls /etc/nginx/sites-enabled 2>/dev/null
ls /etc/caddy 2>/dev/null

section "FIREWALL"
(sudo -n ufw status 2>/dev/null || echo "ufw status needs sudo or not installed")

section "EXISTING PROJECT FOLDERS (names only)"
ls -1 /var/www 2>/dev/null; ls -1 /srv 2>/dev/null; ls -1 /opt 2>/dev/null

section "DONE"
echo "No changes were made."
