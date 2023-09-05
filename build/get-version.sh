#!/bin/bash

# This script generates a package version based on
# the repository status as well as the tags.
set -o nounset -o errexit -o pipefail

usage() {
    echo "Usage: get-version.sh [ --tagprefix tag ] [ --commitish git_commitish ]"
    exit 2
}

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
COMMITISH="HEAD"
DIRTY_TAG=""

SHORTOPTS="h"
LONGOPTS="tagprefix:,commitish:,help"
OPTS=$(getopt  --name="$0" --options=$SHORTOPTS --longoptions=$LONGOPTS -- "$@")
VALID_ARGUMENTS=$# # Returns the count of arguments that are in short or long options

if [ "$VALID_ARGUMENTS" -eq 0 ]; then
  help
fi

eval set -- "$OPTS"

while /bin/true; do
    case "$1" in
        --tagprefix)
            TAG_PREFIX="$2"
            shift 2
            ;;
        --commitish)
            COMMITISH="$2"
            shift 2
            ;;
        -h | --help)
            usage
            ;;
        --)
            shift;
            break
            ;;
        *)
            echo "Unexpected option: $1"
            break;
            ;;
    esac
done

if [ -z "$TAG_PREFIX" ]; then
    usage
fi

# Figure out if the worktree is dirty, we run update-index first
# as we've seen cases in Travis where not doing so causes git to
# treat the worktree as dirty when it is not.
git update-index -q --refresh
if ! git diff-files --quiet .; then
    DIRTY_TAG="dirty"
fi

# If we have an exact tag, just use it.
# ⚠️ This commented block may notwork if the last commit has a tag
#    on it that belongs to another policy package.
# if git describe --tags --exact-match "${COMMITISH}" >/dev/null 2>&1; then
#     echo -n "$(git describe --tags --exact-match "${COMMITISH}")"
#     if [ ! -z "${DIRTY_TAG}" ]; then
#         echo -n "+${DIRTY_TAG}"
#     fi
#     echo ""
#     exit 0
# fi

# Otherwise, increment the patch version, add the -dev tag and some
# commit metadata. If there's no existing tag, pretend a v0.0.0 was
# there so we'll produce v0.0.1-dev builds.
if git describe --tags --abbrev=0 --match "${TAG_PREFIX}-*" "${COMMITISH}" > /dev/null 2>&1; then
    TAG=$(git describe --tags --abbrev=0 --match "${TAG_PREFIX}-*" "${COMMITISH}")
else
    TAG="${TAG_PREFIX}-0.0.0"
fi

# We remove prefix from the tag to expose the bare-ish version
TAG="${TAG##*-}"
# We remove the suffix off any pre-release tag (e.g. from doing a -rc build)
TAG=${TAG%%-*}

MAJOR=$(cut -d. -f1 <<< "${TAG}")
MINOR=$(cut -d. -f2 <<< "${TAG}")
PATCH=$(cut -d. -f3 <<< "${TAG}")

# We want to include some additional information. To the base tag we
# add a timestamp and commit hash. We use the timestamp of the commit
# itself, not the date it was authored (so it will change when someone
# rebases a PR into master, for example).
# echo -n "${MAJOR}.${MINOR}.$((${PATCH}+1))-dev.$(git show -s --format='%ct+g%h' ${COMMITISH})"
echo "${MAJOR}.${MINOR}.$((${PATCH}+1))${DIRTY_TAG:++$DIRTY_TAG}"
