#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Print environment info
echo "=== Build Environment ==="
node -v
npm -v
pwd
ls -la

# Install dependencies with detailed logging
echo "\n=== Installing Dependencies ==="
npm config set legacy-peer-deps true
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --verbose

# Verify installation
echo "\n=== Verifying Installation ==="
npm list react-scripts || echo "react-scripts not found!"

# Build the React app
echo "\n=== Building React App ==="
npm run build --verbose

# Install Python dependencies
echo "\n=== Installing Python Dependencies ==="
cd backend
pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo "\n=== Build Completed Successfully! ==="
ls -la build/
