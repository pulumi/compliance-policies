PROJECT_NAME := pulumi-management
NODE_MODULE_NAME := @pulumi-premium-policies/policy-management
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh)

.PHONY: build lint publish

build:: lint
	@test ! -z "$(VERSION)" || "Unable to determine the package VERSION. Exiting."
	@test ! -z "$(VERSION)" || exit 1
	rm -rf bin/
	yarn install
	yarn build
	sed -e 's/\$${VERSION}/$(VERSION)/g' < package.json > bin/package.json
	cp ../README.md ../LICENSE bin/
	node ../build/reversion.js bin/version.js ${VERSION}
	node ../build/reversion.js bin/version.d.ts ${VERSION}

lint::
	yarn run lint

publish:
	cp .npmrc bin/
	/bin/bash ../build/publish.sh
