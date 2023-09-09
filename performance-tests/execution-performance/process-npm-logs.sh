#!/bin/bash

# set -x

if [ -z "$1" ]; then
    echo "Usage: $0 'file.csv'" >&2
    exit 1
fi

read TOTAL_MS

LOGS_DIR="$HOME/.npm/_logs/"
LOG_FILES="$(find "$LOGS_DIR" -type f -name "*.log" | sort)"
CSV_FILE="$1"
PREMIUM_POLICIES_PACKAGES="policy-manager aws-policies azure-policies google-policies kubernetes-policies"
PULUMI_RESOURCE_PROVIDERS="aws aws-native azure azure-native gcp google-native kubernetes"

NPM_DURATION_MS=0
REIFY_DURATION_MS=0

for LOG_FILE in $LOG_FILES; do
    NPM_MS="$(cat $LOG_FILE | grep 'timing npm Completed' | awk '{print $NF}' | sed 's/ms//;')"
    REIFY_MS="$(cat $LOG_FILE | grep 'timing reify Completed' | awk '{print $NF}' | sed 's/ms//;')"

    NPM_DURATION_MS="$(echo ${NPM_MS:-0}+$NPM_DURATION_MS | bc)"
    REIFY_DURATION_MS="$(echo ${REIFY_MS:-0}+$REIFY_DURATION_MS | bc)"
done

EXECUTION_DURATION_MS="$(echo "$TOTAL_MS-$NPM_DURATION_MS" | bc)"

HEADERS_STRING="total-duration,execution-duration,npm-duration,reify-duration"
VALUES_STRING="$TOTAL_MS,$EXECUTION_DURATION_MS,$NPM_DURATION_MS,$REIFY_DURATION_MS"

# find timings for the premium-policies packages and add them together
PREMIUM_POLICIES_PACKAGES_DURATION_MS=0
for POLICY_PACKAGE in $PREMIUM_POLICIES_PACKAGES; do

    REIFY_PACKAGE_DURATION_MS=0

    for LOG_FILE in $LOG_FILES; do
        REIFY_PACKAGE_MS="$(cat $LOG_FILE | grep "timing reifyNode:node_modules/@pulumi-premium-policies/${POLICY_PACKAGE} .*Completed" | awk '{print $NF}' | sed 's/ms//;')"
        REIFY_PACKAGE_DURATION_MS="$(echo ${REIFY_PACKAGE_MS:-0}+$REIFY_PACKAGE_DURATION_MS | bc)"
        PREMIUM_POLICIES_PACKAGES_DURATION_MS="$(echo ${REIFY_PACKAGE_MS:-0}+$PREMIUM_POLICIES_PACKAGES_DURATION_MS | bc)"
    done

    HEADERS_STRING="$HEADERS_STRING,$POLICY_PACKAGE"
    VALUES_STRING="$VALUES_STRING,$REIFY_PACKAGE_DURATION_MS"
done
HEADERS_STRING="$HEADERS_STRING,@premium-policies/reify"
VALUES_STRING="$VALUES_STRING,$PREMIUM_POLICIES_PACKAGES_DURATION_MS"

# find timings for the pulumi-providers packages and add them together
PULUMI_RESOURCE_PROVIDERS_DURAITON_MS=0
for PROVIDER_PACKAGE in $PULUMI_RESOURCE_PROVIDERS; do

    REIFY_PROVIDER_DURATION_MS=0

    for LOG_FILE in $LOG_FILES; do
        REIFY_PROVIDER_MS="$(cat $LOG_FILE | grep "timing reifyNode:node_modules/@pulumi/${PROVIDER_PACKAGE} .*Completed" | awk '{print $NF}' | sed 's/ms//;')"
        REIFY_PROVIDER_DURATION_MS="$(echo ${REIFY_PROVIDER_MS:-0}+$REIFY_PROVIDER_DURATION_MS | bc)"
        PULUMI_RESOURCE_PROVIDERS_DURAITON_MS="$(echo ${REIFY_PROVIDER_MS:-0}+$PULUMI_RESOURCE_PROVIDERS_DURAITON_MS | bc)"
    done

    HEADERS_STRING="$HEADERS_STRING,$PROVIDER_PACKAGE"
    VALUES_STRING="$VALUES_STRING,$REIFY_PROVIDER_DURATION_MS"
done
HEADERS_STRING="$HEADERS_STRING,@pulumi/reify"
VALUES_STRING="$VALUES_STRING,$PULUMI_RESOURCE_PROVIDERS_DURAITON_MS"

if [ ! -f "$CSV_FILE" ]; then
    echo "$HEADERS_STRING" > $CSV_FILE
fi

echo "$VALUES_STRING" >> $CSV_FILE

exit
