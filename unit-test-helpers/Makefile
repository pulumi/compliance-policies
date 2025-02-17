PROJECT_NAME := unit-test-helpers
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))
NEXT_VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME) --next)

.PHONY: build lint tag upgrade

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

# As a developer, you should run `make tag` to prepare for a new
# release. Once the tag is pushed, GitHub actions will create and
# publish a new release.
tag::

# As a developer, you should run `make changelog` to create a new
# entry in the local `CHANGELOG.md` document. A simple template is
# used and should provide the right blueprint to fill in the blanks.
changelog::
