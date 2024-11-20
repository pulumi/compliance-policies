# Changelog

## @pulumi/google-compliance-policies 0.1.5

### Major new features

* ✨ add support for policy configuration schema as provided by Policy Manager
* ✨ update all unit tests to verify policy configs

### Noteworthy changes

* 🌿 when running the unit tests, check that all unit test files contain expected unit tests

### Dependencies

* ⏩ upgrade @pulumi/gcp to 8.8.0
* ⏩ upgrade @pulumi/compliance-policy-manager to 0.1.5
* ⏩ upgrade @pulumi/compliance-policies-unit-test-helpers to 0.1.5
* ⏩ upgrade @pulumi/policy to ^1.13.0
* ⏩ upgrade @pulumi/pulumi to ^3.138.0

### Notes

This is the first changelog  entry for [`@pulumi/google-compliance-policies`](https://www.npmjs.com/package/@pulumi/google-compliance-policies)
Previous versions and up to 0.1.5 were not published on GitHub.

## @pulumi/google-compliance-policies 0.1.4

### Noteworthy changes

* 🔥 delete unwanted unit tests for `iap` service
* 🔥 remove `iap` service due to https://github.com/pulumi/pulumi-google-native/issues/919 and the way it interacts with `policy-bundler` (due to incorrect resource names)
