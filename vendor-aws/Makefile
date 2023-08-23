PROJECT_NAME := aws-policies
NODE_MODULE_NAME := @pulumi-premium-policies/$(PROJECT_NAME)
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))

# List all services in each provider directory, but search search path is excluded from the results.
# The command hasn't been tested in MacOS
TARGETS := 0-internal $(shell /bin/bash -c "find tests/aws/ tests/awsnative/ -mindepth 1 -maxdepth 1 -type d | grep -v 0-internal | sed 's/^tests\///g;' | sort -du")

# same as above, except that only modified unit tests (unstagged or modified) are taken into account
FAST_TARGETS := 0-internal $(shell /bin/bash -c 'find tests/aws/ tests/awsnative/ -mindepth 1 -maxdepth 1 -type d | grep -v 0-internal | sed "s/^tests\///g;" | sort -du | while read D; do test ! -z "$$(git status --porcelain "tests/$$D")" && echo "$$D"; done')

# After a few tests, I found that running on half available CPUs gives the best performance results.
# Internally to NodeJS, it seems processing is done in parallel at up to 2 CPUs at a time.
# The value can be changed at runtime with MAKEJOBS=1 make test
MAKEJOBS := $(shell /bin/sh -c "test ! -z "$$MAKEJOBS" && echo "$$MAKEJOBS" || echo $$(($$(nproc)/2))")

.PHONY: build lint publish test fasttest sequentialtest fastsequentialtest docfix $(TARGETS)

build::
	@test ! -z "$(VERSION)" || echo "Unable to determine the package VERSION. Exiting."
	@test ! -z "$(VERSION)" || exit 1
	@rm -rf bin/
	@make -C ../policy-bundler/ aws
	@cd .bundle && yarn install
	@cd .bundle && yarn build --outDir ../bin
	@sed -e 's/\$${VERSION}/$(VERSION)/g' < package.json > bin/package.json
	@cp ../README.md ../LICENSE bin/

docfix::
	@make -C ../policy-docs-sync/ runaws

lint::
	@yarn run lint

lintfix::
	@yarn run lintfix

publish:
	@test -z "$(shell echo "$(VERSION)" | grep 'dirty')" || echo "You shouldn't publish a package from a dirty working dir."
	@test -z "$(shell echo "$(VERSION)" | grep 'dirty')" || exit 1
	@cp .npmrc bin/
	@/bin/bash ../build/publish.sh
	@git tag "$(PROJECT_NAME)-$(VERSION)"

stats:
	@echo -n "Number of resources for aws: "
	@find $$PWD/aws -type f  | grep -v index.ts | wc -l
	@echo -n "Number of resources for aws-native: "
	@find $$PWD/awsnative -type f  | grep -v index.ts | wc -l

test::
	@$(MAKE) -j $(MAKEJOBS) sequentialtest

fasttest::
	@$(MAKE) -j $(MAKEJOBS) fastsequentialtest

# Currently, running all unit tests at once causes some massive performance and memory issues
# due to the way NodeJS loads everything into memory. To work around the issue, unit tests are
# executed per service instead as a single block. This way, NodeJS only loads a fraction of
# the provider which improves performance and significantly reduces memory requirements.
sequentialtest: $(TARGETS)

# Same as above, but running only a subset of unit tests to save time.
fastsequentialtest: $(FAST_TARGETS)

# Note that $(TARGETS) includes $(FAST_TARGETS)
$(TARGETS):
	@yarn run targettedtest "tests/$@/**/*.spec.ts"
