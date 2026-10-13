#!/usr/bin/env bash
# Status script for Donkr
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
PIDFILE="$DIR/logs/nginx.pid"

if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE" 2>/dev/null || true)
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        echo "Donkr Nginx is RUNNING (PID: $PID)"
        echo "URL: http://localhost:8080"
        echo "Health:"
        curl -s http://localhost:8080/health || echo "Unable to connect to health endpoint"
        exit 0
    fi
fi

echo "Donkr Nginx is STOPPED."
exit 1
