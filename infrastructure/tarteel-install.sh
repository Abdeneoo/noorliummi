#!/usr/bin/env bash
# Installs the recitation checker built by .github/workflows/tarteel-build.yml. Run as root:  bash tarteel-install.sh <release-tag>
# Touches ONLY /opt/noorliummi/tarteel and the unit noorliummi-tarteel.service. Installs no system packages.
# Hard limits enforced by systemd: 1 CPU core (CPUQuota=100%), 2 GB RAM, no swap, low CPU/IO priority, listens on 127.0.0.1 only.
# Remove everything with: bash tarteel-remove.sh
set -euo pipefail
TAG="${1:?release tag, e.g. tarteel-20261126-1}"; REPO=Abdeneoo/noorliummi; PORT=3050
DIR=/opt/noorliummi/tarteel; UNIT=/etc/systemd/system/noorliummi-tarteel.service; MODEL=ggml-tarteel-base-ar-quran-q5_0.bin
if ss -ltn "( sport = :$PORT )" | grep -q ":$PORT" && ! systemctl is-active --quiet noorliummi-tarteel; then echo "port $PORT is used by something else — stopping"; exit 1; fi
install -d -o noor -g noor -m 755 "$DIR"
cd "$DIR"
for f in SHA256SUMS whisper-server "$MODEL"; do runuser -u noor -- curl -fsSL -o "$f.part" "https://github.com/$REPO/releases/download/$TAG/$f"; done
for f in whisper-server "$MODEL"; do want=$(grep " $f\$" SHA256SUMS.part | cut -d' ' -f1); got=$(sha256sum "$f.part" | cut -d' ' -f1); [ "$want" = "$got" ] || { echo "CHECKSUM MISMATCH $f — stopping"; rm -f ./*.part; exit 1; }; done
for f in SHA256SUMS whisper-server "$MODEL"; do mv "$f.part" "$f"; done; chmod 755 whisper-server; echo "$TAG" > VERSION; chown -R noor:noor "$DIR"
cat > "$UNIT" <<UNITEOF
[Unit]
Description=Noor Li Ummi - recitation checker (whisper.cpp + Tarteel model), local only
After=network.target
[Service]
User=noor
Group=noor
WorkingDirectory=$DIR
ExecStart=$DIR/whisper-server -m $DIR/$MODEL --host 127.0.0.1 --port $PORT -l ar -t 1
Restart=on-failure
RestartSec=5
CPUQuota=100%
MemoryMax=2G
MemorySwapMax=0
Nice=15
IOSchedulingClass=idle
TasksMax=32
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadOnlyPaths=$DIR
[Install]
WantedBy=multi-user.target
UNITEOF
systemctl daemon-reload
systemctl enable --now noorliummi-tarteel >/dev/null 2>&1
sleep 4; systemctl is-active noorliummi-tarteel && echo "tarteel: installed $TAG on 127.0.0.1:$PORT (limits: 1 core, 2G RAM)"
