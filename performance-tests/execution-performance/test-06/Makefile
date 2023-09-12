#!/usr/bin/make

PULUMI_ORG := menfin
POLICY_GROUP := performance

.PHONY: all disable-all-policies clean-npm-logs test-6-1 test-6-2 test-6-3 test-6-4 test-6-5 test-6-6 test-6-7

all: test-6-1 test-6-2 test-6-3 test-6-4 test-6-5 test-6-6 test-6-7

disable-all-policies:
	@pulumi policy disable $(PULUMI_ORG)/aws-premium-policies-typescript-single --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/azure-premium-policies-typescript-single --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/google-premium-policies-typescript-single --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/kubernetes-premium-policies-typescript-single --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/all-premium-policies-typescript-single --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/aws-premium-policies-typescript-all --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/azure-premium-policies-typescript-all --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/google-premium-policies-typescript-all --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/kubernetes-premium-policies-typescript-all --policy-group $(POLICY_GROUP) || echo >/dev/null
	@pulumi policy disable $(PULUMI_ORG)/all-premium-policies-typescript-all --policy-group $(POLICY_GROUP) || echo >/dev/null

clean-npm-logs:
	@test ! -d ~/.npm/_logs/ || find ~/.npm/_logs/ -type f -delete

test-6-1: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s clean-npm-logs; \
		/usr/bin/time --format "%e" pulumi pre 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-6-2: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@pulumi policy enable $(PULUMI_ORG)/aws-premium-policies-typescript-single latest --policy-group $(POLICY_GROUP)
	@pulumi pre >/dev/null 2>&1
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s clean-npm-logs; \
		/usr/bin/time --format "%e" pulumi pre 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-6-3: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@pulumi policy enable $(PULUMI_ORG)/aws-premium-policies-typescript-single latest --policy-group $(POLICY_GROUP)
	@pulumi policy enable $(PULUMI_ORG)/azure-premium-policies-typescript-single latest --policy-group $(POLICY_GROUP)
	@pulumi policy enable $(PULUMI_ORG)/google-premium-policies-typescript-single latest --policy-group $(POLICY_GROUP)
	@pulumi policy enable $(PULUMI_ORG)/kubernetes-premium-policies-typescript-single latest --policy-group $(POLICY_GROUP)
	@pulumi pre >/dev/null 2>&1
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s clean-npm-logs; \
		/usr/bin/time --format "%e" pulumi pre 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-6-4: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@pulumi policy enable $(PULUMI_ORG)/all-premium-policies-typescript-single latest --policy-group $(POLICY_GROUP)
	@pulumi pre >/dev/null 2>&1
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s clean-npm-logs; \
		/usr/bin/time --format "%e" pulumi pre 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-6-5: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@pulumi policy enable $(PULUMI_ORG)/aws-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@pulumi pre >/dev/null 2>&1
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s clean-npm-logs; \
		/usr/bin/time --format "%e" pulumi pre 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-6-6: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@pulumi policy enable $(PULUMI_ORG)/aws-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@pulumi policy enable $(PULUMI_ORG)/azure-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@pulumi policy enable $(PULUMI_ORG)/google-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@pulumi policy enable $(PULUMI_ORG)/kubernetes-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@pulumi pre >/dev/null 2>&1
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s clean-npm-logs; \
		/usr/bin/time --format "%e" pulumi pre 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-6-7: clean-npm-logs
	@$(MAKE) -s disable-all-policies
	@pulumi policy enable $(PULUMI_ORG)/all-premium-policies-typescript-all latest --policy-group $(POLICY_GROUP)
	@pulumi pre >/dev/null 2>&1
	@for i in $(shell /usr/bin/seq 1 10); do \
		$(MAKE) -s clean-npm-logs; \
		/usr/bin/time --format "%e" pulumi pre 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"
