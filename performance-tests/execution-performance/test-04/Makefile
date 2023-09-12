#!/usr/bin/make

.PHONY: all clean-npm-logs test-4-1 test-4-2 test-4-3 test-4-4 test-4-5 test-4-6 test-4-7

all: test-4-1 test-4-2 test-4-3 test-4-4 test-4-5 test-4-6 test-4-7

clean: clean-npm-logs

clean-npm-logs:
	@test ! -d ~/.npm/_logs/ || find ~/.npm/_logs/ -type f -delete

test-4-1: clean-npm-logs
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi pre 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-4-2: clean-npm-logs
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi pre --policy-pack ../packs/aws-premium-policies/single/ 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-4-3: clean-npm-logs
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi pre --policy-pack ../packs/aws-premium-policies/single/ --policy-pack ../packs/azure-premium-policies/single/ --policy-pack ../packs/google-premium-policies/single/ --policy-pack ../packs/kubernetes-premium-policies/single/ 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-4-4: clean-npm-logs
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi pre --policy-pack ../packs/all-premium-policies/single/ 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-4-5: clean-npm-logs
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi pre --policy-pack ../packs/aws-premium-policies/all/ 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-4-6: clean-npm-logs
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi pre --policy-pack ../packs/aws-premium-policies/all/ --policy-pack ../packs/azure-premium-policies/all/ --policy-pack ../packs/google-premium-policies/all/ --policy-pack ../packs/kubernetes-premium-policies/all/ 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-4-7: clean-npm-logs
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi pre --policy-pack ../packs/all-premium-policies/all/ 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"
