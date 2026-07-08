#!/bin/bash
echo "===================================================="
echo "🛡️  Bayanihan Smart Contracts - Slither Static Analysis"
echo "===================================================="
echo "Running Slither via Docker Container..."
echo "Workspace path: $PWD"
echo

# Verify Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running or not in PATH."
    echo "Please make sure Docker is started and try again."
    exit 1
fi

# Pull latest Slither image
echo "📥 Pulling crytic/slither:latest image..."
docker pull crytic/slither:latest

# Execute Slither on contracts folder
echo "🔍 Running static checks..."
docker run --rm -v "$PWD:/share" crytic/slither:latest /share --config-file /share/slither.config.json

echo
echo "===================================================="
echo "✅ Static analysis run completed!"
echo "Results (if any) saved to: auditreport/slither-results.json"
echo "===================================================="
