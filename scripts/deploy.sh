#!/bin/bash

# Deployment script for production

set -e

echo "🚀 Starting deployment..."

# Build unified image
echo "📦 Building unified Docker image..."
docker build -t guess-the-word-unified .

# Tag image for registry
REGISTRY="ghcr.io"
REPO="michal-bures/guess-the-word-together"
TAG=${1:-latest}

echo "🏷️  Tagging image..."
docker tag guess-the-word-unified:latest $REGISTRY/$REPO:$TAG

# Push to registry (if logged in)
if [ "$2" = "--push" ]; then
    echo "⬆️  Pushing image to registry..."
    docker push $REGISTRY/$REPO:$TAG
    echo "✅ Image pushed successfully!"
fi

echo "✅ Deployment preparation complete!"
echo "To run locally: docker-compose -f docker-compose.prod.yml up"