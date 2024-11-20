# Copyright 2016-2024, Pulumi Corporation.  All rights reserved.

SHELL       := /bin/bash
.SHELLFLAGS := -ec

PACKAGE_NAME := $(shell jq -r .name package.json)
CHANGELOG_FILE = "CHANGELOG.md"
NEXT_CLEAN_VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME) --next --nodirty)

# STEP_MESSAGE = @echo -e "\033[0;32m$(shell echo '$@' | tr a-z A-Z | tr '_' ' '):\033[0m"

.PHONY: default prepare newrelease

# ensure that `default` is the target that is run when no arguments are passed to make
default::
all::

prepare::
	@test -d "node_modules" || echo "yarn install"
	@test -d "node_modules" || yarn install

newrelease:
	@test -f CHANGELOG.md || echo "CHANGELOG.md doesn't exist. Creating one."
	@test -f CHANGELOG.md || echo "# Changelog" > CHANGELOG.md
	@grep -q '## $(PACKAGE_NAME) $(NEXT_CLEAN_VERSION)' CHANGELOG.md && echo "Version $(NEXT_CLEAN_VERSION) already exists in CHANGELOG.md" || echo ""
	@grep -q '## $(PACKAGE_NAME) $(NEXT_CLEAN_VERSION)' CHANGELOG.md && exit 1 || echo ""
	@sed '/# Changelog/r ../build/assets/CHANGELOG-TEMPLATE.md' CHANGELOG.md \
		| sed 's|_PACKAGE_NAME_|$(PACKAGE_NAME)|; s|_NEXT_VERSION_|$(NEXT_CLEAN_VERSION)|;' > CHANGELOG-NEW.md
	@mv CHANGELOG-NEW.md CHANGELOG.md