#!/bin/bash

echo "Waiting for database (db:3306)..."
while ! nc -z db 3306; do
  sleep 1
done
echo "Database is UP!"

echo "Applying migrations..."
python manage.py makemigrations api
python manage.py migrate

echo "Seeding data..."
python manage.py seed

echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
