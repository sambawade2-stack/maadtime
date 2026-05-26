#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true

echo "Starting server..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120
