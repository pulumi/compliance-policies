PROJECT_NAME := policy-docs-updater
NODE_MODULE_NAME := @pulumi/$(PROJECT_NAME)
include ../build/common.mk

VERSION := $(shell /bin/bash ../build/get-version.sh --tagprefix $(PROJECT_NAME))

.PHONY: lint run runaws runazure runkubernetes

lint::
	@yarn run lint

run:: runaws runazure runkubernetes

runaws:: lint
	@yarn run updatedocs --directory ../vendor-aws --providers aws,awsnative

runazure:: lint
	@yarn run updatedocs --directory ../vendor-azure --providers azure,azurenative

runkubernetes:: lint
	@yarn run updatedocs --directory ../vendor-kubernetes --providers kubernetes
