#!/usr/bin/env bash
set -e

# 1. Build & deploy backend
echo "Starting local replica..."
dfx start --background
echo "Deploying backend canister..."
dfx deploy liquifusion_backend

# 2. Build frontend
echo "Building frontend..."
cd src/liquifusion_frontend
npm install
npm run build

echo "All done. Frontend dist in src/liquifusion_frontend/dist"
