#!/bin/bash
# Runs automatically the first time the Postgres container initializes.
# Restores the memorial site database dump. Ownership/GRANT statements that
# reference Floot/Neon cloud roles will error harmlessly and are ignored.
set -e

if [ -f /dump/dump.sql ]; then
  echo "Restoring database dump..."
  psql -v ON_ERROR_STOP=0 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /dump/dump.sql || true
  echo "Database restore finished."
else
  echo "WARNING: /dump/dump.sql not found — starting with an empty database."
fi
