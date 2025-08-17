#!/bin/bash

# Local development startup script

set -e

echo "🏗️  Starting local development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start containers
echo "📦 Building and starting containers..."
docker-compose up --build

echo "✅ Local environment is running!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend: http://localhost:3001"
echo "📡 WebSocket: ws://localhost:1234"