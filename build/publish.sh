#!/bin/bash
# publish.sh builds and publishes a release.
set -o nounset -o errexit -o pipefail

echo "Publishing to NPMjs.com:"

if [ ! -f "./bin/index.js" ]; then
    echo "Error: ./bin/index.js not found. Do you need to build?"
    exit 1
fi

# not sure what this does, so commenting out for now
# node $(dirname $0)/promote.js ${@:2} < ./package.json > ./bin/package.json

cd ./bin/

NPM_TAG="dev"

# If the package doesn't have a pre-release tag, use the tag of latest instead of
# dev. NPM uses this tag as the default version to add, so we want it to mean
# the newest released version.
if [[ "$(jq -r .version package.json)" != *-* ]]; then
    NPM_TAG="latest"
fi

# Now, perform the publish.
npm publish --access public -tag ${NPM_TAG}
npm info 2>/dev/null
