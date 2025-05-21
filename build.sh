#!/bin/bash
# Exit on error
set -e

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd /opt/render/project/src
npm install

# Build the frontend
echo "Building frontend..."
npm run build

# Install Python dependencies
echo "Installing Python dependencies..."
cd /opt/render/project/backend
pip install -r requirements.txt

echo "Build completed successfully!"
