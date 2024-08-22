#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# build
# Get the parent directory
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

# Loop through each subdirectory in the parent directory
for dir in "$PARENT_DIR"/*; do
    if [ -d "$dir" ]; then
        echo "Bundling in $dir"
        # Change to the subdirectory
        cd "$dir"
        # Check if package.json exists and has a build script
        if [ -f "package.json" ] && grep -q '"build"' package.json; then
            # Run the npm build script
            node esbuild.mjs
        else
            echo "No build script found in $dir"
        fi
        # Return to the original directory
        cd -
    fi
done
