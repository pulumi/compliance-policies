# Changelog

## @pulumi/compliance-policy-manager 0.1.6

### Major new features

* ✨ add support for policy configuration schema as provided by Policy Manager

### Noteworthy changes

* 🌿 ability to log excluded resources
* 🌿 `ignoreCase` is now an optional property to reduce noise in the Pulumi Console

### Bug fixes

* 🐛 fix incorrect syntax in `Makefile`

### Dependencies

* ⏩ upgrade @pulumi/aws to 6.58.0
* ⏩ upgrade @pulumi/aws-native to 1.6.0
* ⏩ upgrade @pulumi/compliance-policy-manager to 0.1.5
* ⏩ upgrade @pulumi/policy to 1.13.0
* ⏩ upgrade @pulumi/pulumi to 3.138.0
* ⏩ upgrade @pulumi/compliance-policies-unit-test-helpers to 0.1.5

### Notes

This is the first changelog  entry for [`@pulumi/compliance-policy-manager`](https://www.npmjs.com/package/@pulumi/compliance-policy-manager)
Previous version up to 0.1.5 were not published on GitHub.

## @pulumi/compliance-policy-manager 0.1.5

### Major new features

* ✨ Start implementation for more flexible Compliance Ready Policies.
  This commit offers a simple way to inject a policy configuratrion schema into a policy.
  Based on the Policy Pack configuration, Policies leveraging `.shouldEvalPolicy()`
  will be able to determine if a policy should skip the evaluation for a given resource.
  For now, the Pulumi resource name is the element used to determine whether
  the evaluation shouold take place.
* 🌿 implement `.shouldEvalPolicy()` to determine if a policy should evaluate a given resource.
* 🌿 expose `.policyConfigSchema` as a simple policy configuration schema
* 🌿 add interface `PolicyConfigSchemaArgs` interface
* 🌿 add 'upgrade' target to easily upgrade dependencies

### Bug fixes

* 🐛 add missing comment for `PolicyManagerStats` interface

### Dependencies

* ⏩ update @pulumi/policy to 1.13.0
* ⏩ upgrade @pulumi/policy to 1.12.0
* ⏩ upgrade micromatch to 4.0.8
* ⏩ upgrade to @pulumi/policy 1.10.0 and node 20
