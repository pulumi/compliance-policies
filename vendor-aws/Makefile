PROJECT_NAME := aws-policies
include ../build/common.mk

# List all services in each provider directory, but search search path is excluded from the results.
# The command hasn't been tested in MacOS
TARGETS := 0-internal $(shell /bin/bash -c "find tests/aws/ tests/awsnative/ -mindepth 1 -maxdepth 1 -type d | grep -v 0-internal | sed 's/^tests\///g;' | sort -du")

# same as above, except that only modified unit tests (unstagged or modified) are taken into account
FAST_TARGETS := 0-internal $(shell /bin/bash -c 'find tests/aws/ tests/awsnative/ -mindepth 1 -maxdepth 1 -type d | grep -v 0-internal | sed "s/^tests\///g;" | sort -du | while read D; do test ! -z "$$(git status --porcelain "tests/$$D")" && echo "$$D"; done')

.PHONY: build lint publish verifyrelease publishrelease publishnpm test fasttest sequentialtest fastsequentialtest docfix validateunittestfiles $(TARGETS)

build:: prepare
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

lint:: prepare
	@yarn run lint

lintfix:: prepare
	@yarn run lintfix

# As a developer, you should run `make tag` to prepare for a new
# release. Once the tag is pushed, GitHub actions will create and
# publish a new release.
tag::

stats:
	@echo -n "Number of policies for aws: "
	@find $$PWD/aws -type f  | grep -v index.ts | wc -l
	@echo -n "Number of policies for aws-native: "
	@find $$PWD/awsnative -type f  | grep -v index.ts | wc -l

# @pulumi/pulumi and @pulumi/policy usually don't introduce breaking changes
# in minor versions so they get upgraded first and we leave minor upgrade to
# take place.
# For the providers (especially azure native) breaking changes may be
# introduced, we force an exact match to avoid issues down the line. We do the
# same for the unit test helper and policy manager.
upgrade::
	@yarn upgrade $(shell cat package.json | jq '.dependencies | to_entries[] | select(.value | contains("^")) | .key + "@latest" ') --save
	@yarn upgrade @pulumi/compliance-policies-unit-test-helpers@latest $(shell cat package.json | jq '.dependencies | to_entries[] | select(.value | contains("^") | not ) | .key + "@latest" ') --exact --save

# runs sequential tests in parallel.
test:: prepare
	@$(MAKE) -j $(MAKEJOBS) sequentialtest

# ensure unit test files contain some required unit tests for quality and assurance purpose.
validateunittestfiles:
	@test "$(shell find tests/aws/ tests/awsnative/ -name "*.spec.ts" -exec grep -L '"name"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'name' unit test"
	@test "$(shell find tests/aws/ tests/awsnative/ -name "*.spec.ts" -exec grep -L '"registration"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'registration' unit test"
	@test "$(shell find tests/aws/ tests/awsnative/ -name "*.spec.ts" -exec grep -L '"metadata"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'metadata' unit test"
	@test "$(shell find tests/aws/ tests/awsnative/ -name "*.spec.ts" -exec grep -L '"enforcementLevel"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'enforcementLevel' unit test"
	@test "$(shell find tests/aws/ tests/awsnative/ -name "*.spec.ts" -exec grep -L '"description"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'description' unit test"
	@test "$(shell find tests/aws/ tests/awsnative/ -name "*.spec.ts" -exec grep -L '"code"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'code' unit test"
	@test "$(shell find tests/aws/ tests/awsnative/ -name "*.spec.ts" -exec grep -L '"policy-config-include"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'policy-config-include' unit test"
	@test "$(shell find tests/aws/ tests/awsnative/ -name "*.spec.ts" -exec grep -L '"policy-config-exclude"' {} + | wc -l)" -eq "0" && echo "* All unit test files have 'policy-config-exclude' unit test"
	@test "$(shell find tests/aws/ tests/awsnative/ -name "*.spec.ts" -exec grep -L '"#1"' {} + | wc -l)" -eq "0" && echo "* All unit test files have '#1' unit test"

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
