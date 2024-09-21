PROJECT_NAME := policy-gen
NODE_MODULE_NAME := @pulumi/$(PROJECT_NAME)
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))
MAX_POLICIES := "500"

.PHONY: build lint

build:: prepare lint
	@test ! -z "$(VERSION)" || echo "Unable to determine the package VERSION. Exiting."
	@test ! -z "$(VERSION)" || exit 1
	@rm -rf bin/
	@yarn install
	@yarn build
	@sed -e 's/\$${VERSION}/$(VERSION)/g' < package.json > bin/package.json
	@cp ../README.md ../LICENSE bin/

lint:: prepare
	@yarn run lint

runkubernetes:: prepare lint
	@MAX_POLICIES=$(MAX_POLICIES) \
		PROVIDER_NAME="kubernetes" \
		PROVIDER_DIRECTORY="../vendor-kubernetes/" \
		PROVIDER_VERSION="$(shell jq -r '.dependencies."@pulumi/kubernetes" | gsub("\\^"; "")' ../vendor-kubernetes/package.json)" \
		yarn run genpolicies

dryrunkubernetes:: prepare lint
	@MAX_POLICIES=$(MAX_POLICIES) \
		PROVIDER_NAME="kubernetes" \
		PROVIDER_DIRECTORY="../vendor-kubernetes/" \
		PROVIDER_VERSION="$(shell jq -r '.dependencies."@pulumi/kubernetes" | gsub("\\^"; "")' ../vendor-kubernetes/package.json)" \
		DRY_RUN="--dry-run" \
		yarn run genpolicies

runazurenative:: prepare lint
	@MAX_POLICIES=$(MAX_POLICIES) \
		PROVIDER_NAME="azure-native" \
		PROVIDER_DIRECTORY="../vendor-azure/" \
		PROVIDER_VERSION="$(shell jq -r '.dependencies."@pulumi/azure-native" | gsub("\\^"; "")' ../vendor-azure/package.json)" \
		yarn run genpolicies

dryrunazurenative:: prepare lint
	@MAX_POLICIES=$(MAX_POLICIES) \
		PROVIDER_NAME="azure-native" \
		PROVIDER_DIRECTORY="../vendor-azure/" \
		PROVIDER_VERSION="$(shell jq -r '.dependencies."@pulumi/azure-native" | gsub("\\^"; "")' ../vendor-azure/package.json)" \
		DRY_RUN="--dry-run" \
		yarn run genpolicies

rungooglenative:: prepare lint
	@MAX_POLICIES=$(MAX_POLICIES) \
		PROVIDER_NAME="google-native" \
		PROVIDER_DIRECTORY="../vendor-google/" \
		PROVIDER_VERSION="$(shell jq -r '.dependencies."@pulumi/google-native" | gsub("\\^"; "")' ../vendor-google/package.json)" \
		yarn run genpolicies

dryrungooglenative:: prepare lint
	@MAX_POLICIES=$(MAX_POLICIES) \
		PROVIDER_NAME="google-native" \
		PROVIDER_DIRECTORY="../vendor-google/" \
		PROVIDER_VERSION="$(shell jq -r '.dependencies."@pulumi/google-native" | gsub("\\^"; "")' ../vendor-google/package.json)" \
		DRY_RUN="--dry-run" \
		yarn run genpolicies
