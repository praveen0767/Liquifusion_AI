#!/usr/bin/env bash
set -e

# Generate Candid interface for backend canister
cd src/liquifusion_backend
dfx canister create liquifusion_backend --no-wallet
dfx build liquifusion_backend
dfx canister id liquifusion_backend > ../canister_ids.json
dfx generate liquifusion_backend --did > liquifusion_backend.did
echo "Generated DID and updated canister_ids.json"
