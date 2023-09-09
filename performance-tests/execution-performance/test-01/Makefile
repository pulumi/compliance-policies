#!/usr/bin/make

.PHONY: all clean-npm-logs clean-npm-cache test-1-1 test-1-2 test-1-3 test-1-4 test-1-5 test-1-6 test-1-7

all: test-1-1 test-1-2 test-1-3 test-1-4 test-1-5 test-1-6 test-1-7

clean: clean-npm-logs clean-npm-cache

clean-npm-logs:
	@test ! -d ~/.npm/_logs/ || find ~/.npm/_logs/ -type f -delete

clean-npm-cache:
	@rm -rf ~/.npm/_cacache/

test-1-1: clean-npm-logs clean-npm-cache
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi up --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
		pulumi destroy --yes --skip-preview; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-1-2: clean-npm-logs clean-npm-cache
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi up --policy-pack ../packs/aws-premium-policies/single/ --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
		pulumi destroy --yes --skip-preview; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-1-3: clean-npm-logs clean-npm-cache
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi up --policy-pack ../packs/aws-premium-policies/single/ --policy-pack ../packs/azure-premium-policies/single/ --policy-pack ../packs/google-premium-policies/single/ --policy-pack ../packs/kubernetes-premium-policies/single/ --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
		pulumi destroy --yes --skip-preview; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-1-4: clean-npm-logs clean-npm-cache
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi up --policy-pack ../packs/all-premium-policies/single/ --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
		pulumi destroy --yes --skip-preview; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-1-5: clean-npm-logs clean-npm-cache
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi up --policy-pack ../packs/aws-premium-policies/all/ --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
		pulumi destroy --yes --skip-preview; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-1-6: clean-npm-logs clean-npm-cache
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi up --policy-pack ../packs/aws-premium-policies/all/ --policy-pack ../packs/azure-premium-policies/all/ --policy-pack ../packs/google-premium-policies/all/ --policy-pack ../packs/kubernetes-premium-policies/all/ --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
		pulumi destroy --yes --skip-preview; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"

test-1-7: clean-npm-logs clean-npm-cache
	@for i in $(shell /usr/bin/seq 1 10); do \
		/usr/bin/time --format "%e" pulumi up --policy-pack ../packs/all-premium-policies/all/ --yes --skip-preview 2>&1 | tail -n 1 | ../convert-time.sh | bash -x ../process-npm-logs.sh $@.csv; \
		pulumi destroy --yes --skip-preview; \
	done
	@cat $@.csv | sed 's/,/\t/g;' > $@.tsv
	@code -r $@.tsv || echo "vscode not installed"
