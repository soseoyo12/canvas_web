#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Print Node.js and npm versions
node -v
npm -v

# Install dependencies with legacy peer deps
echo "Installing Node.js dependencies with legacy peer deps..."
npm install --legacy-peer-deps

# Build the React app
echo "Building React app..."
npm run build

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Build completed successfully!"
