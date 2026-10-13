#!/usr/bin/env bash
# Stop Donkr Nginx server
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
PIDFILE="$DIR/logs/nginx.pid"

if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE" 2>/dev/null || true)
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        echo "Stopping Donkr Nginx (PID: $PID)..."
        kill -QUIT "$PID" 2>/dev/null || kill -TERM "$PID" 2>/dev/null || true
        rm -f "$PIDFILE"
        echo "Donkr Nginx stopped."
        exit 0
    fi
    rm -f "$PIDFILE"
fi

echo "Donkr Nginx is not currently running."

