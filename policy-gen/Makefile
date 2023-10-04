PROJECT_NAME := policy-gen
NODE_MODULE_NAME := @pulumi/$(PROJECT_NAME)
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))

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
	@yarn run runkubernetes

dryrunkubernetes:: prepare lint
	@yarn run dryrunkubernetes

runazurenative:: prepare lint
	@yarn run runazurenative

dryrunazurenative:: prepare lint
	@yarn run dryrunazurenative

rungooglenative:: prepare lint
	@yarn run rungooglenative

dryrungooglenative:: prepare lint
	@yarn run dryrungooglenative
