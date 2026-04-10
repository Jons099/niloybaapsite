#!/bin/bash

# Deployment script for Luxe Attire eCommerce Platform

set -e

echo "🚀 Starting deployment of Luxe Attire..."

# Load environment variables
source .env.production

# Pull latest changes
echo "📦 Pulling latest code..."
git pull origin main

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm ci --production
cd ..

# Install frontend dependencies and build
echo "📦 Building frontend..."
cd client
npm ci
npm run build
cd ..

# Run database migrations
echo "🗄️ Running database migrations..."
cd server
npm run migrate
cd ..

# Restart services
echo "🔄 Restarting services..."
pm2 restart ecosystem.config.js --env production

# Clear cache
echo "🧹 Clearing cache..."
redis-cli FLUSHALL

# Health check
echo "🏥 Running health check..."
sleep 5
curl -f http://localhost:5000/api/health || exit 1

echo "✅ Deployment completed successfully!"