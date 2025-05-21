#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Build the React app
echo "Building React app..."
npm run build

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Build completed successfully!"
