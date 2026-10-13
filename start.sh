#!/usr/bin/env bash
# Start Donkr Nginx server
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
PIDFILE="$DIR/logs/nginx.pid"

mkdir -p "$DIR/logs" "$DIR/temp/body" "$DIR/temp/proxy" "$DIR/temp/fastcgi" "$DIR/temp/uwsgi" "$DIR/temp/scgi"

if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE" 2>/dev/null || true)
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        echo "Donkr Nginx is already running (PID: $PID) on http://localhost:8080"
        exit 0
    else
        rm -f "$PIDFILE"
    fi
fi

echo "Starting Donkr Nginx server on port 8080..."
nginx -c "$DIR/nginx.conf"

sleep 0.5
if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE")
    echo "Donkr Nginx successfully started! (PID: $PID)"
    echo "Open: http://localhost:8080"
else
    echo "Warning: PID file not found, checking process status..."
    ps aux | grep nginx | grep donkr || true
fi
