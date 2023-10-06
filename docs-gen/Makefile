PROJECT_NAME := docs-gen
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))
NEXT_VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME) --next)

.PHONY: policy-manager aws azure google kubernetes upgrade

all:: policy-manager aws azure google kubernetes

policy-manager:
	@yarn run policy-manager

aws:
	@yarn run aws

azure:
	@yarn run azure

google:
	@yarn run google

kubernetes:
	@yarn run google

upgrade::
	@yarn upgrade $(shell cat package.json | jq .dependencies | jq -r 'keys[] + "@latest"') --save
