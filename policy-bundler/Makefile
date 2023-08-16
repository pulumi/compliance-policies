PROJECT_NAME := policy-gen
NODE_MODULE_NAME := @pulumi/$(PROJECT_NAME)
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))

.PHONY: build lint

build:: lint
	@test ! -z "$(VERSION)" || echo "Unable to determine the package VERSION. Exiting."
	@test ! -z "$(VERSION)" || exit 1
	@rm -rf bin/
	@yarn install
	@yarn build
	@sed -e 's/\$${VERSION}/$(VERSION)/g' < package.json > bin/package.json
	@cp ../README.md ../LICENSE bin/

lint::
	@yarn run lint

aws:: lint
	@yarn run aws

azure:: lint
	@yarn run azure

kubernetes:: lint
	@yarn run kubernetes