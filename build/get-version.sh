#!/bin/bash

# This script generates a package version based on
# the repository status as well as the tags.
set -o nounset -o errexit -o pipefail

usage() {
    echo "Usage: get-version.sh [ --tagprefix tag ] [ --commitish git_commitish ] [ --nextversion | --next | --previousversion | --previous]"
    exit 2
}

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
COMMITISH="HEAD"
DIRTY_TAG=""
# 0 = current version, will be determined based on git tags
# 1 = next version, the value is computed based on the most recent version.
# -1 = previous version, will be determined based on git tags, one before last
REQUESTED_VERSION=0

SHORTOPTS="h"
LONGOPTS="tagprefix:,commitish:,help,nextversion,next,previousversion,previous"
OPTS=$(getopt  --name="$0" --options=$SHORTOPTS --longoptions=$LONGOPTS -- "$@")
VALID_ARGUMENTS=$# # Returns the count of arguments that are in short or long options

if [ "$VALID_ARGUMENTS" -eq 0 ]; then
  usage
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
        --next | --nextversion)
            if [ "$REQUESTED_VERSION" -ne 0 ]; then
                echo "options --next(version) and --previous(version) are mutually exclusive"
                usage
            fi
            REQUESTED_VERSION=1
            shift 1
            ;;
        --previous | --previousversion)
            if [ "$REQUESTED_VERSION" -ne 0 ]; then
                echo "options --next(version) and --previous(version) are mutually exclusive"
                usage
            fi
            REQUESTED_VERSION=-1
            shift 1
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

# When requesting the next minor version,
if [ "$REQUESTED_VERSION" -eq 1 ]; then
    # Figure out if the worktree is dirty, we run update-index first
    # as we've seen cases in Travis where not doing so causes git to
    # treat the worktree as dirty when it is not.
    git update-index -q --refresh
    if ! git diff-files --quiet .; then
        DIRTY_TAG="dirty"
    fi
fi

case "$REQUESTED_VERSION" in
    "1")
        TAG="$(git for-each-ref --sort=creatordate --format '%(refname:short)' "refs/tags/${TAG_PREFIX}-*" | sed "s/${TAG_PREFIX}-//;" | tail -n 1)"
        if [ -z "$TAG" ]; then
            TAG="0.0.0"
        fi
        MAJOR="$(cut -d. -f1 <<< "${TAG}")"
        MINOR="$(cut -d. -f2 <<< "${TAG}")"
        PATCH="$(cut -d. -f3 <<< "${TAG}")"

        # We want to include some additional information. To the base tag we
        # add a timestamp and commit hash. We use the timestamp of the commit
        # itself, not the date it was authored (so it will change when someone
        # rebases a PR into master, for example).
        echo "${MAJOR}.${MINOR}.$((${PATCH}+${REQUESTED_VERSION}))${DIRTY_TAG:++$DIRTY_TAG}"
        ;;
    "0")
        git for-each-ref --sort=creatordate --format '%(refname:short)' "refs/tags/${TAG_PREFIX}-*" | sed "s/${TAG_PREFIX}-//;" | tail -n 1
        ;;
    "-1")
        git for-each-ref --sort=creatordate --format '%(refname:short)' "refs/tags/${TAG_PREFIX}-*" | sed "s/${TAG_PREFIX}-//;" | tail -n 2 | head -n 1
        ;;
esac


