# Copyright 2016-2024, Pulumi Corporation.  All rights reserved.

SHELL       := /bin/bash
.SHELLFLAGS := -ec

# STEP_MESSAGE = @echo -e "\033[0;32m$(shell echo '$@' | tr a-z A-Z | tr '_' ' '):\033[0m"

.PHONY: default prepare

# ensure that `default` is the target that is run when no arguments are passed to make
default::
all::

prepare::
	@test -d "node_modules" || echo "yarn install"
	@test -d "node_modules" || yarn install
