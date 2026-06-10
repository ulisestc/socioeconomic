#!/bin/bash

echo "Generando migraciones (si aplica)..."
python manage.py makemigrations api --noinput

# MySQL 8 abre el puerto durante su init temporal antes de estar realmente listo,
# por eso esperamos reintentando migrate (más fiable que un simple chequeo de puerto).
echo "Esperando a la base de datos y aplicando migraciones..."
tries=0
until python manage.py migrate --noinput; do
  tries=$((tries+1))
  if [ "$tries" -ge 30 ]; then
    echo "ERROR: la base de datos no respondió tras 30 intentos."
    exit 1
  fi
  echo "Base de datos no lista (intento $tries), reintentando en 3s..."
  sleep 3
done

echo "Sembrando datos iniciales..."
python manage.py seed

echo "Iniciando servidor..."
exec python manage.py runserver 0.0.0.0:8000
