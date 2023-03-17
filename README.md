# Pulumi Policies

This repository contains a growing set of Premium Policies to validate your infrastructure using
Policy-as-Code.

## Current project state

The project is currently in an `alpha` state and is subject to breaking changes. However, feedback
and suggestions are welcome to help shape how this product will look like.

## Policies

Folders named `vendor-*` contain individual policies for each supported vendor. Each vendor may
contain one or more Pulumi provider.

Read more about adding new policies in [`docs/policies/`](docs/policies/) and in the official
[documentation](https://www.pulumi.com/docs/guides/crossguard/core-concepts/#policy).

## Policy packs

The [`policy-packs/`](policy-packs/) folder contains groups of policies assembled into Policy Packs.
These packs are only for demos and development purposes.

Read more about creating new Policy Packs in [`docs/policy-packs/`](docs/policy-packs/) and in the
official [documentation](https://www.pulumi.com/docs/guides/crossguard/core-concepts/#policy-pack).

## Helpful commands

To connect to the CodeArtifact repository (for package publishing purpose), run the command below

In bash/zsh

```bash
export CODEARTIFACT_AUTH_TOKEN="$(aws --region ap-southeast-2 codeartifact get-authorization-token --domain pulumi-policy-as-code --query authorizationToken --output text)"
```

In fish

```fish
set -gx CODEARTIFACT_AUTH_TOKEN (aws --region ap-southeast-2 codeartifact get-authorization-token --domain pulumi-policy-as-code --query authorizationToken --output text)
```
