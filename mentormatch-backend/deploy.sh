#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Safe zero-downtime-ish redeploy for MentorMatch backend
#
# USAGE (on the AWS EC2 instance):
#   cd /path/to/mentormatch-backend
#   git pull origin main
#   bash deploy.sh
#
# WHAT IT DOES:
#   1. Pulls latest images / rebuilds only the backend container.
#   2. NEVER removes the postgres_data volume so the database is preserved.
#   3. Recreates only the backend container; the DB container keeps running.
# =============================================================================

set -euo pipefail

echo "============================================"
echo " MentorMatch — Safe Deploy"
echo "============================================"

# ---- Safety check: never allow -v (volume removal) ----
# (just in case someone wraps this script later)
if [[ "${1:-}" == *"-v"* ]]; then
    echo "ERROR: Refusing to run with volume-removal flags."
    exit 1
fi

echo "[1/3] Rebuilding backend image (no cache) …"
docker compose build --no-cache backend

echo "[2/3] Recreating backend container (DB stays untouched) …"
docker compose up -d --no-deps --force-recreate backend

echo "[3/3] Cleaning up dangling images …"
docker image prune -f

echo ""
echo "Deploy complete. Database volume preserved."
echo "Run 'docker compose logs -f backend' to follow logs."
