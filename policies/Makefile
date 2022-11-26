PROJECT_NAME := pulumi-policies
NODE_MODULE_NAME := @bobcatt/pulumi-policies
include build/common.mk

VERSION := $(shell /bin/bash ./build/get-version.sh)

.PHONY: build ensure publish test_all

build:: lint
	@test ! -z "$(VERSION)" || "Unable to determine the package VERSION. Exiting."
	@test ! -z "$(VERSION)" || exit 1
	rm -rf bin/
	yarn install
	yarn build
	sed -e 's/\$${VERSION}/$(VERSION)/g' < package.json > bin/package.json
	cp ../README.md ../LICENSE bin/
	node build/reversion.js bin/version.js ${VERSION}
	node build/reversion.js bin/version.d.ts ${VERSION}

lint::
	yarn run lint

test_all::
	yarn run test

test_fast::
	yarn run test

publish:
	/bin/bash ./build/publish.sh