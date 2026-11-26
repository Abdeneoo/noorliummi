#!/usr/bin/env bash
# Removes the recitation checker completely (service, unit file, files). Run as root. Touches nothing else.
set -u
systemctl disable --now noorliummi-tarteel >/dev/null 2>&1 || true
rm -f /etc/systemd/system/noorliummi-tarteel.service; systemctl daemon-reload
rm -rf /opt/noorliummi/tarteel
echo "tarteel: removed"
