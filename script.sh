#!/usr/bin/env bash
cargo build --release --target wasm32-unknown-unknown --package freelance_backend
candid-extractor target/wasm32-unknown-unknown/release/freelance_backend.wasm > freelance_backend.did