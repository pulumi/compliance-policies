PROJECT_NAME := azure-policies
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))
NEXT_VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME) --next)

# List all services in each provider directory, but search search path is excluded from the results.
# The command hasn't been tested in MacOS
TARGETS := 0-internal $(shell /bin/bash -c "find tests/azure/ tests/azurenative/ -mindepth 2 -maxdepth 2 -type d | grep -v 0-internal | sed 's/^tests\///g;' | sort -du")

# same as above, except that only modified unit tests (unstagged or modified) are taken into account
FAST_TARGETS := 0-internal $(shell /bin/bash -c 'find tests/azure/ tests/azurenative/ -mindepth 2 -maxdepth 2 -type d | grep -v 0-internal | sed "s/^tests\///g;" | sort -du | while read D; do test ! -z "$$(git status --porcelain "tests/$$D")" && echo "$$D"; done')

# After a few tests, I found that running on half available CPUs gives the best performance results.
# Internally to NodeJS, it seems processing is done in parallel at up to 2 CPUs at a time.
# The value can be changed at runtime with MAKEJOBS=1 make test
MAKEJOBS := $(shell /bin/sh -c "test ! -z "$$MAKEJOBS" && echo "$$MAKEJOBS" || echo $$(($$(nproc)/2))")

.PHONY: build lint publish test fasttest sequentialtest fastsequentialtest docfix validateunittestfiles $(TARGETS)

build:: prepare
	@test ! -z "$(VERSION)" || echo "Unable to determine the package VERSION. Exiting."
	@test ! -z "$(VERSION)" || exit 1
	@rm -rf bin/
	@make -C ../policy-bundler/ azure
	@cd .bundle && yarn install
	@cd .bundle && yarn build --outDir ../bin
	@sed -e 's/\$${VERSION}/$(VERSION)/g' < .bundle/package.json > bin/package.json
	@cp ../README.md ../LICENSE bin/

docfix::
	@make -C ../policy-docs-sync/ runazure

lint:: prepare
	@yarn run lint

lintfix:: prepare
	@yarn run lintfix

tag:
	@test -z "$(shell echo "$(NEXT_VERSION)" | grep 'dirty')" || echo "You shouldn't tag a package from a dirty working dir."
	@test -z "$(shell echo "$(NEXT_VERSION)" | grep 'dirty')" || exit 1
	@git tag "$(PROJECT_NAME)-$(NEXT_VERSION)"
	@echo 'You should now run `git push && git push --tags` to trigger a new release'

publish:
	@test -z "$(shell echo "$(VERSION)" | grep 'dirty')" || echo "You shouldn't publish a package from a dirty working dir."
	@test -z "$(shell echo "$(VERSION)" | grep 'dirty')" || exit 1
	@/bin/bash ../build/publish.sh

stats:
	@echo -n "Number of policies for azure: "
	@find $$PWD/azure -type f | grep -v index.ts | wc -l
	@echo -n "Number of policies for azure-native: "
	@find $$PWD/azurenative -type f | grep -v index.ts | wc -l

# @p/pulumi and @p/policy usually don't introduce breaking changes
# so they get upgraded first and we leave minor upgrade to take place.
# for the providers (especially azure native) breaking changes may be
# introduce, you we force an exact match to avoid issues down the line.
# we do the same for the unit test helper and policy manager.
upgrade::
	@yarn upgrade $(shell cat package.json | jq '.dependencies | to_entries[] | select(.value | contains("^")) | .key + "@latest" ') --save
	@yarn upgrade @pulumi/compliance-policies-unit-test-helpers@latest $(shell cat package.json | jq '.dependencies | to_entries[] | select(.value | contains("^") | not ) | .key + "@latest" ') --exact --save

# runs sequential tests in parallel.
test::
	@$(MAKE) -j $(MAKEJOBS) sequentialtest

# ensure unit test files contain some required unit tests for quality and assurance purpose.
validateunittestfiles:
	@test "$(shell find tests/azure/ tests/azurenative/ -name "*.spec.ts" -exec grep -L '"name"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'name' unit test"
	@test "$(shell find tests/azure/ tests/azurenative/ -name "*.spec.ts" -exec grep -L '"registration"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'registration' unit test"
	@test "$(shell find tests/azure/ tests/azurenative/ -name "*.spec.ts" -exec grep -L '"metadata"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'metadata' unit test"
	@test "$(shell find tests/azure/ tests/azurenative/ -name "*.spec.ts" -exec grep -L '"enforcementLevel"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'enforcementLevel' unit test"
	@test "$(shell find tests/azure/ tests/azurenative/ -name "*.spec.ts" -exec grep -L '"description"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'description' unit test"
	@test "$(shell find tests/azure/ tests/azurenative/ -name "*.spec.ts" -exec grep -L '"code"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'code' unit test"
	@test "$(shell find tests/azure/ tests/azurenative/ -name "*.spec.ts" -exec grep -L '"policy-config-include"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'policy-config-include' unit test"
	@test "$(shell find tests/azure/ tests/azurenative/ -name "*.spec.ts" -exec grep -L '"policy-config-exclude"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'policy-config-exclude' unit test"
	@test "$(shell find tests/azure/ tests/azurenative/ -name "*.spec.ts" -exec grep -L '"#1"' {} + | wc -l)" -eq "0" && echo "* All unit test files have '#1' unit test"

# runs limited tests in parallel.
fasttest::
	@$(MAKE) -j $(MAKEJOBS) fastsequentialtest

# Currently, running all unit tests at once causes some massive performance and memory issues
# due to the way NodeJS loads everything into memory. To work around the issue, unit tests are
# executed per service instead as a single block. This way, NodeJS only loads a fraction of
# the provider which improves performance and significantly reduces memory requirements.
sequentialtest: validateunittestfiles $(TARGETS)

# Same as above, but running only a subset of unit tests to save time.
fastsequentialtest: validateunittestfiles $(FAST_TARGETS)

# Note that $(TARGETS) includes $(FAST_TARGETS)
$(TARGETS): prepare
	@yarn run targettedtest "tests/$@/**/*.spec.ts"
