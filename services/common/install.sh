#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# build
# Get the parent directory
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

# Loop through each subdirectory in the parent directory
for dir in "$PARENT_DIR"/*; do
    if [ -d "$dir" ]; then
        echo "Cleaning in $dir"
        # Change to the subdirectory
        cd "$dir"
        # Check if package.json exists and has a clean script
        if [ -f "package.json" ] && grep -q '"clean"' package.json; then
            # Run the npm clean script
            npm install --frozen-lockfile
        else
            npm install --frozen-lockfile
        fi
        # Return to the original directory
        cd -
    fi
done
