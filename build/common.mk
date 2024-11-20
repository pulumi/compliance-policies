# Copyright 2016-2024, Pulumi Corporation.  All rights reserved.

SHELL       := /bin/bash
.SHELLFLAGS := -ec

PACKAGE_NAME := $(shell jq -r .name package.json)
CHANGELOG_FILE = "CHANGELOG.md"

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))
NEXT_VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME) --next)
PREVIOUS_VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME) --previous)
NEXT_CLEAN_VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME) --next --nodirty)

# After a few tests, I found that running on half available CPUs gives the best performance results.
# Internally to NodeJS, it seems processing is done in parallel at up to 2 CPUs at a time.
# The value can be changed at runtime with MAKEJOBS=1 make test
MAKEJOBS := $(shell /bin/sh -c "test ! -z "$$MAKEJOBS" && echo "$$MAKEJOBS" || echo $$(($$(nproc)/2))")

.PHONY: default prepare newrelease

# ensure that `default` is the target that is run when no arguments are passed to make
default::
all::

prepare::
	@test -d "node_modules" || echo "yarn install"
	@test -d "node_modules" || yarn install

tag::
	@test -z "$(shell echo "$(NEXT_VERSION)" | grep 'dirty')" || echo "You shouldn't tag a package from a dirty working dir."
	@test -z "$(shell echo "$(NEXT_VERSION)" | grep 'dirty')" || exit 1
	@git tag "$(PROJECT_NAME)-$(NEXT_VERSION)"
	@echo 'You should now run `git push && git push --tags` to trigger a new release'

newrelease:
	@test -f $(CHANGELOG_FILE) || echo "$(CHANGELOG_FILE) doesn't exist. Creating one."
	@test -f $(CHANGELOG_FILE) || echo "# Changelog" > $(CHANGELOG_FILE)
	@grep -q '## $(PACKAGE_NAME) $(NEXT_CLEAN_VERSION)' $(CHANGELOG_FILE) && echo "Version $(NEXT_CLEAN_VERSION) already exists in $(CHANGELOG_FILE)" || echo ""
	@grep -q '## $(PACKAGE_NAME) $(NEXT_CLEAN_VERSION)' $(CHANGELOG_FILE) && exit 1 || echo ""
	@sed '/# Changelog/r ../build/assets/CHANGELOG-TEMPLATE.md' $(CHANGELOG_FILE) \
		| sed 's|_PACKAGE_NAME_|$(PACKAGE_NAME)|; s|_NEXT_VERSION_|$(NEXT_CLEAN_VERSION)|;' > CHANGELOG-NEW.md
	@mv CHANGELOG-NEW.md $(CHANGELOG_FILE)

publish:: verifyrelease publishrelease publishnpm

# verify the release has all the correct information
verifyrelease::
	@test -z "$(shell echo "$(VERSION)" | grep 'dirty')" || echo "You can't publish a package from a dirty working dir."
	@test -z "$(shell echo "$(VERSION)" | grep 'dirty')" || exit 1
	@test -f "$(CHANGELOG_FILE)" || echo "Missing $(CHANGELOG_FILE) file"
	@test -f "$(CHANGELOG_FILE)" || exit 1
	@test ! -z "$$NPM_TOKEN" || echo "Missing NPM_TOKEN variable"
	@test ! -z "$$NPM_TOKEN" || exit 1
	@test ! -z "$$NODE_AUTH_TOKEN" || echo "Missing NODE_AUTH_TOKEN variable"
	@test ! -z "$$NODE_AUTH_TOKEN" || exit 1
	@test ! -z "$$GH_TOKEN" || echo "Missing GH_TOKEN variable"
	@test ! -z "$$GH_TOKEN" || exit 1

# publish the github release with the changelog
publishrelease::
	@sed -n "/## $(shell echo "$(PACKAGE_NAME)" | sed 's|/|\\/|;') $(VERSION)/,/## $(shell echo "$(PACKAGE_NAME)" | sed 's|/|\\/|;')/p;" $(CHANGELOG_FILE) | sed 'N;$!P;$!D;$d' > .CHANGELOG.md
	@test -s .CHANGELOG.md || echo "The extracted changelog appears to be empty. Not publishing a release without a changelog."
	@test -s .CHANGELOG.md || exit 1
	@gh release create "$(PROJECT_NAME)-$(VERSION)" --notes-file .CHANGELOG.md

# publish the package on npm
publishnpm::
	@/bin/bash ../build/publish.sh
