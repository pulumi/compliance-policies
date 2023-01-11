# Pulumi Policies
<!-- markdownlint-disable MD013 -->
This repository contains a growing set of Pulumi policies to validate your infrastructure using Policy-as-Code.

## Current project state

The project is currently in a `alpha` state and is subject to potentially breaking changes. However, feedback and suggestions are most welcome to help shape how this product will look like.

## Policies

The [`policies/docs/`](policies/docs) folder contains all individual policies for each supported provider and the corresponding unit tests.

A Policy contains specific logic you would like to enforce. For example, you may want to prevent the creation of public, world-readable storage objects. (e.g. on AWS S3, Azure BlobStore, etc.) or prevent the creation of a virtual machine without the proper security groups in-place.

For more information, see our [documentation](https://www.pulumi.com/docs/guides/crossguard/core-concepts/#policy).

## Policy packs

The [`policy-packs/`](policy-packs) folder contains the policies assembled into Policy packs.

A Policy Pack can contain one or more policies to enforce. Packs provide a way to group together similar policies. For example, you may decide to have one pack with AWS policies and another with Kubernetes-specific policies. That being said, there are no restrictions on which policies you combine within a pack, and you should pack them however makes sense for your organization.

For more information, see our [documentation](https://www.pulumi.com/docs/guides/crossguard/core-concepts/#policy-pack).

## Testing

### Precondition

Due to the large size of the `azure-native` provider, you need to set following environment variable to run the tests:

```bash
export NODE_OPTIONS="--max-old-space-size=8192"
```

### Unit tests

Run the tests with follwing command:

```bash
cd policies
make tests
```
