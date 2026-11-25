#!/usr/bin/env bash
# Noor Li Ummi — staging deploy. Run as root on the VPS:
#   bash /opt/noorliummi/app/infrastructure/deploy-staging.sh
#
# Touches ONLY: /opt/noorliummi, the unit noorliummi-web.service, and the single
# file /etc/caddy/sites/40-noorliummi.caddy. It never edits other sites' files,
# never restarts Caddy (graceful reload only, after validation), and rolls its own
# Caddy file back if validation fails.
set -euo pipefail

APP_HOME=/opt/noorliummi
APP=$APP_HOME/app
PNPM=$APP_HOME/.local/node_modules/.bin/pnpm
PORT=3040
DOMAIN=staging.noorliummi.io
CADDY_SITE=/etc/caddy/sites/40-noorliummi.caddy
UNIT=/etc/systemd/system/noorliummi-web.service
as_noor() { runuser -u noor -- env HOME=$APP_HOME PATH="$APP_HOME/.local/node_modules/.bin:/usr/local/bin:/usr/bin:/bin" CI=1 "$@"; }

echo "== 1/6 update code"
as_noor git -C "$APP" fetch --quiet origin main
as_noor git -C "$APP" reset --quiet --hard origin/main
echo "at commit $(as_noor git -C "$APP" rev-parse --short HEAD)"

echo "== 2/6 install"
as_noor sh -c "cd $APP && $PNPM install --frozen-lockfile --silent"

echo "== 3/6 Quran integrity gate"
as_noor sh -c "cd $APP && $PNPM predeploy" | grep -E "Tests|passed|failed"

echo "== 4/6 build"
as_noor sh -c "cd $APP && $PNPM --filter @noor/web build" | tail -4

echo "== 5/6 service"
cat > "$UNIT" <<UNITEOF
[Unit]
Description=Noor Li Ummi web (staging)
After=network.target

[Service]
User=noor
Group=noor
WorkingDirectory=$APP/apps/web
Environment=NODE_ENV=production
Environment=HOME=$APP_HOME
ExecStart=/usr/bin/env node node_modules/next/dist/bin/next start -p $PORT -H 127.0.0.1
Restart=on-failure
RestartSec=3
MemoryMax=1G
CPUQuota=150%
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_HOME

[Install]
WantedBy=multi-user.target
UNITEOF
systemctl daemon-reload
systemctl enable --quiet noorliummi-web.service
systemctl restart noorliummi-web.service
for i in 1 2 3 4 5 6 7 8 9 10; do
  code=$(curl -s -o /dev/null -m 3 -w '%{http_code}' "http://127.0.0.1:$PORT/" || true)
  [ "$code" = "200" ] && break; sleep 1
done
echo "local health: $code"
[ "$code" = "200" ] || { echo "Service is not healthy; Caddy left untouched."; systemctl status noorliummi-web.service --no-pager | tail -8; exit 1; }

echo "== 6/6 caddy"
if ! grep -Eq '^\s*import\s+.*sites/' /etc/caddy/Caddyfile; then
  echo "Caddyfile does not import sites/*; not changing Caddy. Showing its import lines:"; grep -n import /etc/caddy/Caddyfile || true; exit 1
fi
if [ ! -f "$CADDY_SITE" ]; then
  cat > "$CADDY_SITE" <<CADDYEOF
$DOMAIN {
	encode zstd gzip
	header X-Robots-Tag "noindex, nofollow"
	reverse_proxy 127.0.0.1:$PORT
}
CADDYEOF
  if caddy validate --config /etc/caddy/Caddyfile >/tmp/noor-caddy-validate.log 2>&1; then
    systemctl reload caddy
    echo "caddy: site added and reloaded"
  else
    rm -f "$CADDY_SITE"
    echo "caddy: validation FAILED, our file was removed, nothing reloaded:"; tail -5 /tmp/noor-caddy-validate.log; exit 1
  fi
else
  echo "caddy: site file already present, unchanged"
fi
sleep 4
echo "public: https://$DOMAIN -> $(curl -s -o /dev/null -m 20 -w '%{http_code}' https://$DOMAIN/ || true)"
echo "DONE"
