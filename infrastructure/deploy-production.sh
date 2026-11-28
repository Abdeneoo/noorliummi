#!/usr/bin/env bash
# Noor Li Ummi — production (https://noorliummi.io). Run as root on the VPS, AFTER staging is deployed and tested:
#   bash /opt/noorliummi/app/infrastructure/deploy-production.sh
#
# Promotes exactly the commit that staging runs now. Production is a separate copy with its own build (public: NOOR_PUBLIC=1),
# its own database (noorliummi_prod), its own service and port — so tests on staging never touch production data.
# Touches ONLY: /opt/noorliummi-prod, units noorliummi-prod*.{service,timer}, the PostgreSQL role+database noorliummi_prod,
# and the single file /etc/caddy/sites/41-noorliummi-prod.caddy (graceful reload after validation, rolled back on failure).
# Installs no packages, never edits other sites' files, never restarts Caddy.
set -euo pipefail

STAGE=/opt/noorliummi; SRC=$STAGE/app; STAGE_PORT=3040
HOME_P=/opt/noorliummi-prod; APP=$HOME_P/app; SECRETS=$HOME_P/secrets
PORT=3041; DOMAIN=noorliummi.io; WWW=www.noorliummi.io
UNIT=/etc/systemd/system/noorliummi-prod.service; CADDY_SITE=/etc/caddy/sites/41-noorliummi-prod.caddy
PNPM=$STAGE/.local/node_modules/.bin/pnpm
# Same user and pnpm store as staging (HOME=$STAGE), so packages are not downloaded twice.
as_noor() { runuser -u noor -- env HOME=$STAGE PATH="$STAGE/.local/node_modules/.bin:/usr/local/bin:/usr/bin:/bin" CI=1 "$@"; }
cd "$STAGE"

echo "== 0/7 checks"
[ "$(curl -s -o /dev/null -m 10 -w '%{http_code}' http://127.0.0.1:$STAGE_PORT/ || true)" = 200 ] || { echo "staging is not healthy — stopping"; exit 1; }
COMMIT=$(as_noor git -C "$SRC" rev-parse HEAD); echo "promoting staging commit $COMMIT"
if ss -ltn "( sport = :$PORT )" | grep -q ":$PORT" && ! systemctl is-active --quiet noorliummi-prod; then echo "port $PORT is used by something else — stopping"; exit 1; fi

echo "== 1/7 code"
install -d -o noor -g noor -m 755 "$HOME_P"; install -d -o noor -g noor -m 700 "$SECRETS"
if [ ! -d "$APP/.git" ]; then as_noor git clone --quiet "$SRC" "$APP"; fi
as_noor git -C "$APP" fetch --quiet "$SRC" "$COMMIT"
as_noor git -C "$APP" reset --quiet --hard "$COMMIT"
# Large pinned sources: copy what staging already verified (the fetch scripts re-check every SHA-256 and skip what matches).
for d in hadith-fawazahmed0 hadith-openiti library-openiti; do
  [ -d "$SRC/database/sources/$d/files" ] && as_noor mkdir -p "$APP/database/sources/$d/files" && as_noor cp -a "$SRC/database/sources/$d/files/." "$APP/database/sources/$d/files/"
done
[ -d "$SRC/apps/web/public/audio/adhkar" ] && as_noor mkdir -p "$APP/apps/web/public/audio/adhkar" && as_noor cp -a "$SRC/apps/web/public/audio/adhkar/." "$APP/apps/web/public/audio/adhkar/"

echo "== 2/7 install + sources"
as_noor sh -c "cd $APP && $PNPM install --frozen-lockfile --silent"
as_noor bash "$APP/infrastructure/fetch-opendua-audio.sh"
as_noor bash "$APP/infrastructure/fetch-hadith.sh"

echo "== 3/7 tests + build (public build)"
as_noor sh -c "cd $APP && $PNPM predeploy" | grep -E "Tests|passed|failed"
as_noor sh -c "cd $APP && NOOR_PUBLIC=1 SITE_URL=https://$DOMAIN $PNPM --filter @noor/web build" | tail -3

echo "== 4/7 database (noorliummi_prod only)"
q() { sudo -u postgres psql -X -tA -v ON_ERROR_STOP=1 "$@"; }
if [ "$(q -c "SELECT 1 FROM pg_roles WHERE rolname='noorliummi_prod'")" != "1" ]; then
  PW=$(openssl rand -hex 24)
  q -v pw="$PW" <<'SQL'
CREATE ROLE noorliummi_prod LOGIN PASSWORD :'pw' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION CONNECTION LIMIT 20;
SQL
  ( umask 077; printf 'DATABASE_URL=postgresql://noorliummi_prod:%s@127.0.0.1:5432/noorliummi_prod\n' "$PW" > "$SECRETS/db.env" ); unset PW
  chown noor:noor "$SECRETS/db.env"; chmod 600 "$SECRETS/db.env"; echo "role: created"
else
  [ -f "$SECRETS/db.env" ] || { echo "role exists but $SECRETS/db.env is missing — stopping"; exit 1; }
fi
if [ "$(q -c "SELECT 1 FROM pg_database WHERE datname='noorliummi_prod'")" != "1" ]; then
  sudo -u postgres createdb -O noorliummi_prod -E UTF8 -T template0 noorliummi_prod
  q -d noorliummi_prod -c "REVOKE ALL ON DATABASE noorliummi_prod FROM PUBLIC; REVOKE ALL ON SCHEMA public FROM PUBLIC; GRANT ALL ON SCHEMA public TO noorliummi_prod;" >/dev/null
  echo "database: created"
fi
as_noor sh -c "set -a; . $SECRETS/db.env; set +a; bash $APP/infrastructure/migrate.sh" | tail -3
# App and mail settings are the same as staging's (admin token, mail sender); copied once, never overwritten.
for f in app.env mail.env; do [ -f "$STAGE/secrets/$f" ] && [ ! -f "$SECRETS/$f" ] && install -o noor -g noor -m 600 "$STAGE/secrets/$f" "$SECRETS/$f"; done
install -d -m 700 -o noor -g noor "$HOME_P/recordings" "$HOME_P/backups"; install -d -m 755 -o noor -g noor "$HOME_P/reports"

echo "== 5/7 service"
cat > "$UNIT" <<UNITEOF
[Unit]
Description=Noor Li Ummi web (production)
After=network.target postgresql.service

[Service]
User=noor
Group=noor
WorkingDirectory=$APP/apps/web
Environment=NODE_ENV=production
Environment=HOME=$HOME_P
Environment=NOOR_HOME=$HOME_P
Environment=NOOR_PUBLIC=1
Environment=SITE_URL=https://$DOMAIN
EnvironmentFile=-$SECRETS/app.env
EnvironmentFile=-$SECRETS/mail.env
EnvironmentFile=$SECRETS/db.env
ExecStart=/usr/bin/env node node_modules/next/dist/bin/next start -p $PORT -H 127.0.0.1
Restart=on-failure
RestartSec=3
MemoryMax=1500M
CPUQuota=200%
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$HOME_P

[Install]
WantedBy=multi-user.target
UNITEOF
# SITE_URL/NOOR_PUBLIC in app.env must not override production's: they are set above and app.env is staging's copy.
sed -i '/^\(SITE_URL\|NOOR_PUBLIC\)=/d' "$SECRETS/app.env" 2>/dev/null || true
systemctl daemon-reload; systemctl enable --quiet noorliummi-prod.service; systemctl restart noorliummi-prod.service
for i in $(seq 1 15); do code=$(curl -s -o /dev/null -m 3 -w '%{http_code}' "http://127.0.0.1:$PORT/" || true); [ "$code" = 200 ] && break; sleep 1; done
echo "local health: $code"
[ "$code" = 200 ] || { echo "production service is not healthy; Caddy left untouched."; systemctl status noorliummi-prod --no-pager | tail -8; exit 1; }
curl -s -o /dev/null -m 60 "http://127.0.0.1:$PORT/api/hadith/search?q=%D8%A7%D9%84%D8%B5%D9%84%D8%A7%D8%A9" || true

echo "== 6/7 backup + health timers (production units only)"
cat > /etc/systemd/system/noorliummi-prod-backup.service <<BEOF
[Unit]
Description=Noor Li Ummi production database backup (noorliummi_prod only)
[Service]
Type=oneshot
User=noor
Group=noor
Environment=HOME=$HOME_P
Environment=NOOR_HOME=$HOME_P
ExecStart=/usr/bin/env bash $APP/infrastructure/backup-db.sh
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$HOME_P/backups
BEOF
cat > /etc/systemd/system/noorliummi-prod-backup.timer <<BEOF
[Unit]
Description=Daily Noor Li Ummi production database backup
[Timer]
OnCalendar=*-*-* 03:47:00
RandomizedDelaySec=10m
Persistent=true
[Install]
WantedBy=timers.target
BEOF
cat > /etc/systemd/system/noorliummi-prod-health.service <<BEOF
[Unit]
Description=Noor Li Ummi production health check (restarts only the production web service)
[Service]
Type=oneshot
ExecStart=/usr/bin/env bash -c 'for i in 1 2 3; do c=\$(curl -s -o /dev/null -m 10 -w "%%{http_code}" http://127.0.0.1:$PORT/ || true); [ "\$c" = 200 ] && exit 0; sleep 10; done; echo "noorliummi-prod health: restarting"; systemctl restart noorliummi-prod.service'
BEOF
cat > /etc/systemd/system/noorliummi-prod-health.timer <<BEOF
[Unit]
Description=Noor Li Ummi production health check every 5 minutes
[Timer]
OnBootSec=3min
OnUnitActiveSec=5min
[Install]
WantedBy=timers.target
BEOF
cat > /etc/systemd/system/noorliummi-prod-ihupdates.service <<BEOF
[Unit]
Description=Noor Li Ummi production: weekly IslamHouse update check (talks to our own app only)
[Service]
Type=oneshot
User=noor
Group=noor
Environment=NOOR_HOME=$HOME_P
ExecStart=/usr/bin/env bash $APP/infrastructure/check-ih-updates.sh $PORT
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
BEOF
cat > /etc/systemd/system/noorliummi-prod-ihupdates.timer <<BEOF
[Unit]
Description=Weekly IslamHouse update check (production)
[Timer]
OnCalendar=Sat *-*-* 05:23:00
RandomizedDelaySec=20m
Persistent=true
[Install]
WantedBy=timers.target
BEOF
systemctl daemon-reload
systemctl enable --now --quiet noorliummi-prod-backup.timer noorliummi-prod-health.timer noorliummi-prod-ihupdates.timer
systemctl start noorliummi-prod-backup.service && journalctl -u noorliummi-prod-backup.service -n 2 --no-pager -o cat | grep -E "backup ok|rror" || true

echo "== 7/7 caddy"
MYIP=$(curl -s -m 10 https://api.ipify.org || true); DNSIP=$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}')
if [ -z "$MYIP" ] || [ "$MYIP" != "$DNSIP" ]; then
  echo "DNS for $DOMAIN points to ${DNSIP:-nothing}, this server is ${MYIP:-unknown}: Caddy not changed yet (it would fail to get a certificate)."
  echo "After the DNS A record points here, run this script again."; echo "DONE (service ready on 127.0.0.1:$PORT)"; exit 0
fi
grep -Eq '^\s*import\s+.*sites/' /etc/caddy/Caddyfile || { echo "Caddyfile does not import sites/*; not changing Caddy."; exit 1; }
NEW=$(mktemp); cat > "$NEW" <<CADDYEOF
$DOMAIN {
	encode zstd gzip
	reverse_proxy 127.0.0.1:$PORT
}
$WWW {
	redir https://$DOMAIN{uri} permanent
}
CADDYEOF
if [ -f "$CADDY_SITE" ] && cmp -s "$NEW" "$CADDY_SITE"; then echo "caddy: unchanged"; rm -f "$NEW"
else
  OLD=""; [ -f "$CADDY_SITE" ] && OLD=$(mktemp) && cp "$CADDY_SITE" "$OLD"
  install -m 644 "$NEW" "$CADDY_SITE"; rm -f "$NEW"
  if caddy validate --config /etc/caddy/Caddyfile >/tmp/noor-caddy-validate.log 2>&1; then systemctl reload caddy; echo "caddy: production site added and reloaded"; [ -n "$OLD" ] && rm -f "$OLD"
  else if [ -n "$OLD" ]; then mv "$OLD" "$CADDY_SITE"; else rm -f "$CADDY_SITE"; fi; echo "caddy: validation FAILED, our file restored, nothing reloaded:"; tail -5 /tmp/noor-caddy-validate.log; exit 1; fi
fi
sleep 8
echo "public: https://$DOMAIN -> $(curl -s -o /dev/null -m 30 -w '%{http_code}' https://$DOMAIN/ || true) · https://$WWW -> $(curl -s -o /dev/null -m 30 -w '%{http_code}' https://$WWW/ || true)"
echo "DONE"
if [ -f "$STAGE/secrets/existing-sites.txt" ]; then
  echo "== existing sites (should be unchanged)"
  while read -r u; do [ -n "$u" ] && echo "$(curl -s -o /dev/null -m 15 -w '%{http_code}' "$u") $u"; done < "$STAGE/secrets/existing-sites.txt"
fi
