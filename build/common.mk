# Copyright 2016-2024, Pulumi Corporation.  All rights reserved.

SHELL       := /bin/bash
.SHELLFLAGS := -ec

PACKAGE_NAME := $(shell jq -r .name package.json)
CHANGELOG_FILE = "CHANGELOG.md"

# STEP_MESSAGE = @echo -e "\033[0;32m$(shell echo '$@' | tr a-z A-Z | tr '_' ' '):\033[0m"

.PHONY: default prepare newrelease

# ensure that `default` is the target that is run when no arguments are passed to make
default::
all::

prepare::
	@test -d "node_modules" || echo "yarn install"
	@test -d "node_modules" || yarn install

newrelease:
	@sed '/# Changelog/r ../build/assets/CHANGELOG-TEMPLATE.md' CHANGELOG.md \
		| sed 's|_PACKAGE_NAME_|$(PACKAGE_NAME)|;' > CHANGELOG-NEW.md
	@mv CHANGELOG-NEW.md CHANGELOG.md