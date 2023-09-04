PROJECT_NAME := policy-packs-gen
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

genaws:: lint
	@yarn run gen-aws

genazure:: lint
	@yarn run gen-azure

gengoogle:: lint
	@yarn run gen-google

genkubernetes:: lint
	@yarn run gen-kubernetes

all:: lint genaws genazure gengoogle genkubernetes