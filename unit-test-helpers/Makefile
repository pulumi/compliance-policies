PROJECT_NAME := unit-test-helpers
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))
NEXT_VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME) --next)

.PHONY: build lint publish

build:: prepare lint
	@test ! -z "$(VERSION)" || echo "Unable to determine the package VERSION. Exiting."
	@test ! -z "$(VERSION)" || exit 1
	@rm -rf bin/
	@yarn install
	@yarn build
	@sed -e 's/\$${VERSION}/$(VERSION)/g' < package.json > bin/package.json
	@cp ../README.md ../LICENSE bin/
	@node ../build/reversion.js bin/version.js $(VERSION)
	@node ../build/reversion.js bin/version.d.ts $(VERSION)

lint:: prepare
	@yarn run lint

upgrade:: prepare
	@yarn upgrade @pulumi/policy@latest --save
	@yarn upgrade @pulumi/compliance-policy-manager@latest --exact --save

tag:
	@test -z "$(shell echo "$(NEXT_VERSION)" | grep 'dirty')" || echo "You shouldn't tag a package from a dirty working dir."
	@test -z "$(shell echo "$(NEXT_VERSION)" | grep 'dirty')" || exit 1
	@git tag "$(PROJECT_NAME)-$(NEXT_VERSION)"
	@echo 'You should now run `git push && git push --tags` to trigger a new release'

publish:
	@test -z "$(shell echo "$(VERSION)" | grep 'dirty')" || echo "You shouldn't publish a package from a dirty working dir."
	@test -z "$(shell echo "$(VERSION)" | grep 'dirty')" || exit 1
	@/bin/bash ../build/publish.sh
