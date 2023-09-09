#!/bin/bash

# set -x

# convert a time duration expression in seconds into milliseconds.
read TOTAL_SECONDS
TOTAL_MS=$(echo "$TOTAL_SECONDS * 1000" | bc | sed 's/\.00$//g;')
echo "$TOTAL_MS"
