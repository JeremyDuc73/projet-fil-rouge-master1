#!/bin/bash

# ============================================
# CineZone - Production Deployment Script
# ============================================

set -e  # Exit on error

echo "🚀 Starting CineZone deployment..."

# Variables
APP_DIR="/var/www/cinezone"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to app directory
cd "$APP_DIR"

echo -e "${BLUE}📦 Pulling latest code...${NC}"
git pull origin main

# Backup database
if [ "$1" != "--skip-backup" ]; then
    echo -e "${BLUE}💾 Backing up database...${NC}"
    mkdir -p "$BACKUP_DIR"
    docker exec cinezone-postgres pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
    echo -e "${GREEN}✅ Database backup created${NC}"
    
    # Keep only last 7 backups
    ls -t "$BACKUP_DIR"/db_backup_*.sql.gz | tail -n +8 | xargs -r rm
fi

# Build new images
echo -e "${BLUE}🔨 Building Docker images...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache

# Stop old containers
echo -e "${BLUE}⏹️  Stopping old containers...${NC}"
docker compose -f docker-compose.prod.yml down

# Start new containers
echo -e "${BLUE}▶️  Starting new containers...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Wait for health checks
echo -e "${BLUE}🏥 Waiting for services to be healthy...${NC}"
sleep 10

# Check if services are up
if docker compose -f docker-compose.prod.yml ps | grep -q "unhealthy\|exited"; then
    echo -e "${RED}❌ Deployment failed! Services are not healthy.${NC}"
    echo "Rolling back..."
    # Optionally restore from backup here
    exit 1
fi

# Clean up old images
echo -e "${BLUE}🧹 Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application is live at: https://cinezone.jeremyduc.dev${NC}"

# Show logs
echo -e "${BLUE}📋 Recent logs:${NC}"
docker compose -f docker-compose.prod.yml logs --tail=20
