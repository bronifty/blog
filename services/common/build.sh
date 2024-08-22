#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# build
# Get the parent directory
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

# Loop through each subdirectory in the parent directory
for dir in "$PARENT_DIR"/*; do
    if [ -d "$dir" ]; then
        echo "Building in $dir"
        # Change to the subdirectory
        cd "$dir"
        # Check if package.json exists and has a build script
        if [ -f "package.json" ] && grep -q '"build"' package.json; then
            # Run the npm build script
            npm run build
        else
            echo "No build script found in $dir"
        fi
        # Return to the original directory
        cd -
    fi
done

#!/bin/bash

# Build common service
echo "Building common service in $(pwd)"
npm run build

# Build react-router-7-contacts service
cd ../react-router-7-contacts
echo "Building react-router-7-contacts service in $(pwd)"
npm install --frozen-lockfile
npm run build

# Create a lambda.zip file for react-router-7-contacts
echo "Creating lambda.zip for react-router-7-contacts"
zip -r lambda.zip . -x "node_modules/*" "*.git*"

# Return to the original directory
cd ../common