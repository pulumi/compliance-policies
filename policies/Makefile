PROJECT_NAME := pulumi-policies
NODE_MODULE_NAME := @bobcatt/pulumi-policies
include build/common.mk

VERSION := $(shell build/get-version.sh)

.PHONY: build ensure publish test_all

build::
	rm -rf bin/
	yarn install
	yarn build
	sed -e 's/\$${VERSION}/$(VERSION)/g' < package.json > bin/package.json
	cp ../README.md ../LICENSE bin/
	node ../scripts/reversion.js bin/version.js ${VERSION}

lint::
	yarn run lint

test_all::
	yarn run test

test_fast::
	yarn run test

publish:
	./build/publish.sh