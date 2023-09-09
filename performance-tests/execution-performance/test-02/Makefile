#!/usr/bin/make

PULUMI_ORG := menfin
POLICY_GROUP := performance

.PHONY: all disable-all-policies clean-npm-logs clean-npm-cache delete-installed-policies test-2-1 test-2-2 test-2-3 test-2-4

all: test-2-1 test-2-2 test-2-3 test-2-4

disable-all-policies:
	@pulumi policy disable $(PULUMI_ORG)/aws-premium-policies-typescript-all --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/azure-premium-policies-typescript-all --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/google-premium-policies-typescript-all --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/kubernetes-premium-policies-typescript-all --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/all-premium-policies-typescript-all --policy-group $(POLICY_GROUP) || echo >/dev/null

clean-npm-logs:
	@test ! -d ~/.npm/_logs/ || find ~/.npm/_logs/ -type f -delete

clean-npm-cache:
	@rm -rf ~/.npm/_cacache/

delete-installed-policies:
	@rm -rf ~/.pulumi/policies/$(PULUMI_ORG)/

test-2-1: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s delete-installed-policies clean-npm-cache clean-npm-logs; \
        /usr/bin/time --format "%e" pulumi up --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
        pulumi destroy --yes --skip-preview; \
	done

test-2-2: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@pulumi policy enable $(PULUMI_ORG)/aws-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s delete-installed-policies clean-npm-cache clean-npm-logs; \
        /usr/bin/time --format "%e" pulumi up --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
        pulumi destroy --yes --skip-preview; \
	done

test-2-3: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@pulumi policy enable $(PULUMI_ORG)/aws-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@pulumi policy enable $(PULUMI_ORG)/azure-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@pulumi policy enable $(PULUMI_ORG)/google-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@pulumi policy enable $(PULUMI_ORG)/kubernetes-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s delete-installed-policies clean-npm-cache clean-npm-logs; \
        /usr/bin/time --format "%e" pulumi up --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
        pulumi destroy --yes --skip-preview; \
	done

test-2-4: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@pulumi policy enable $(PULUMI_ORG)/all-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s delete-installed-policies clean-npm-cache clean-npm-logs; \
        /usr/bin/time --format "%e" pulumi up --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
        pulumi destroy --yes --skip-preview; \
	done

# $(MAKE) -s clean-npm-logs delete-installed-policies;
