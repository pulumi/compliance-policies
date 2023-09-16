# Unit test suites

Unit tests are performed using [Mocha](https://mochajs.org/). All unit tests are stored in `tests/`.
See the [project structure](../project-structure.md) above to understand how unit tests are organized.

When a new policy is added it should always be accompanied by the relevant unit tests as described
below. Additionally, all `reportViolation` should be tested.

## Building a compliant resource

Where possible, a single compliant resource (ie, a resource that passes all the unit tests) should
be created per unit test file. This is the recommended approach to reduce complexity and ease maintenance.

Here is an example for an EBS Volume

```ts
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.ebs.Volume, {
        encrypted: true,
        kmsKeyId: kms.keyArn,
        availabilityZone: root.availabilityZone1,
        size: 16,
    });
}
```

## Using Enums

In each provider unit test folder, there's a file named `enums.ts`. This file contains `enum`
organized per service as a way to avoid hardcoding values in the unit tests.

Developers are encouraged to use these predefined values and add more of them over time.

```ts
/* ... */
export enum ec2 {
    imageId = "ami-12345678",
    instanceType = "t2-micro",
    vpcSecurityGroupId = "sg-12345678",
    vpcId = "vpc-12345678",
    cidrBlock = "10.0.0.0/8",
    ipv6CidrBlock = "fd29:be60:c157:350f::/64",
    subnetId1 = "subnet-0a8c929d00b5373c1",
    subnetId2 = "subnet-01969596cadb0d862",
}

export enum iam {
    roleArn = "arn:aws:iam::123456781234:role/aws-iam-role-12345678",
    sslCertificateArn = "arn:aws:iam::123456781234:server-certificate/certName",
}
/* ... */
```

## Unit tests

Unit tests are built following the same model. A `describe()` function contains all the tests for a
**single policy**. If the resource has multiple policies, then `describe()` is used multiple times.

The suite name passed to `describe()` is the actual policy code path as the policy is loaded in the suite.

```ts
describe("aws.ebs.Volume.disallowUnencryptedVolume", () => {
    const policy = policies.aws.ebs.Volume.disallowUnencryptedVolume;

    /**
     * Some unit tests below
     */
    it("...", async () => { /* ... */ });
});
```

### Common unit tests

Each policy should be tested against a few common unit tests.

* name
* registration
* metadata
* enforcement level
* description

### Policy unit tests

In addition to common unit tests, 2 or more custom tests should be written.

First, the [compliant resource](#building-a-compliant-resource) should be tested to ensure no
violation report is returned.

```ts
    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });
```

Then, each violation report should be triggered and tested accordingly.

```ts
    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.kmsKeyId = undefined;
        await assertHasResourceViolation(policy, args, { message: "An EBS volume should be encrypted using a customer-managed KMS key." });
    });
```

### Increase NodeJS memory

When running unit tests, NodeJS may run out of memory due to `azure-native`. To increase the memory,
use the following command:

```bash
export NODE_OPTIONS="--max-old-space-size=8192"
```

### Running unit tests

Run the tests with follwing command:

```bash
cd vendor-?
make tests
```
