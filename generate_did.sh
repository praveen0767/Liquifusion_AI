#!/usr/bin/env bash

function generate_did() {
    local canister=$1
    canister_root="src/$canister"

    # Build the canister
    cargo build --manifest-path="$canister_root/Cargo.toml" \
        --target wasm32-unknown-unknown \
        --release --package "$canister"

    # Extract the Candid interface using ic-wasm
    ic-wasm "target/wasm32-unknown-unknown/release/$canister.wasm" --extract-candid \
        > "$canister_root/$canister.did"
}

CANISTERS="freelance_backend"

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_did "$canister"
done
