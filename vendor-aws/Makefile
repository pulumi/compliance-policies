PROJECT_NAME := aws-policies
NODE_MODULE_NAME := @pulumi-premium-policies/$(PROJECT_NAME)
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))

.PHONY: build lint publish test watchtest

build:: lint test
	@test ! -z "$(VERSION)" || echo "Unable to determine the package VERSION. Exiting."
	@test ! -z "$(VERSION)" || exit 1
	@rm -rf bin/
	@yarn install
	@yarn build
	@sed -e 's/\$${VERSION}/$(VERSION)/g' < package.json > bin/package.json
	@cp ../README.md ../LICENSE bin/
	@node ../build/reversion.js bin/version.js $(VERSION)
	@node ../build/reversion.js bin/version.d.ts $(VERSION)

lint::
	@yarn run lint

test:: lint
	@yarn run test

watchtest::
	@yarn run watchtest

publish:
	@test -z "$(shell echo "$(VERSION)" | grep 'dirty')" || echo "You shouldn't publish a package from a dirty working dir."
	@test -z "$(shell echo "$(VERSION)" | grep 'dirty')" || exit 1
	@cp .npmrc bin/
	@/bin/bash ../build/publish.sh
	@git tag "$(PROJECT_NAME)-$(VERSION)"