# Changelog

## @pulumi/aws-compliance-policies 0.0.22

### Major new features

* n/a

### Noteworthy changes

* ✨ update alb/lb listeners policies to support more listener policies
* 🐛 update vendor link to TLS policies

### Dependencies

* ⏩ upgrade @pulumi/aws to 6.64.0
* ⏩ upgrade @pulumi/aws-native to 1.14.0
* ⏩ upgrade @pulumi/pulumi to 3.142.0

## @pulumi/aws-compliance-policies 0.0.21

### Major new features

* ✨ add support for policy configuration schema as provided by Policy Manager

### Noteworthy changes

* 🌿 update all resources for unit tests as to provide the policy config and the resource name
* 🌿 update unit tests to ensure policy configs work as expected
* 🌿 when running the unit tests, check that all unit test files contain expected unit tests
* 🐛 add a few missing unit tests
* 🌿 improve `make upgrade` for some stricter versioning
* 🌿 add `make validateunittestfiles` to all vendors

### Dependencies

* ⏩ upgrade @pulumi/aws to 6.58.0
* ⏩ upgrade @pulumi/aws-native to 1.6.0
* ⏩ upgrade @pulumi/compliance-policy-manager to 0.1.5
* ⏩ upgrade @pulumi/policy to 1.13.0
* ⏩ upgrade @pulumi/pulumi to 3.138.0
* ⏩ upgrade @pulumi/compliance-policies-unit-test-helpers to 0.1.5

### Notes

This is the first changelog  entry for [`@pulumi/aws-compliance-policies`](https://www.npmjs.com/package/@pulumi/aws-compliance-policies)
Previous version up to 0.0.21 were not published on GitHub.

## @pulumi/aws-compliance-policies 0.0.20

### Dependencies

* ⏩ upgrade @pulumi/compliance-policy-manager to 0.1.4
* ⏩ upgrade @pulumi/compliance-policies-unit-test-helpers to 0.1.4
* ⏩ upgrade @pulumi/aws to 6.52.0
* ⏩ upgrade @pulumi/aws-native to 0.123.0
* ⏩ upgrade @pulumi/pulumi to 3.133.0
