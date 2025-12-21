#!/bin/bash
# ========================================
# STS Frontend Development Script
# ========================================

set -e

cd "$(dirname "$0")/.."

echo "⚛️  STS Frontend Development Server"
echo "===================================="

# Load environment variables
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "Starting Next.js development server..."
echo "App: http://localhost:3000"
echo ""

# Run the development server
npm run dev
