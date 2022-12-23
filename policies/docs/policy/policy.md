# Policy-as-Code

This document discusses how to write a new policy.

Writing a new Policy is as easy as usual. Though, to augment capabilities, there are additional functions and features as it's described below.

Linting and unit testing will help ensure consistency throughout the project.

## Table of content

- [Policy-as-Code](#policy-as-code)
  - [Table of content](#table-of-content)
  - [Policy location](#policy-location)
  - [File header](#file-header)
  - [Default imports](#default-imports)
  - [Policy registration](#policy-registration)
  - [Coding guide](#coding-guide)
    - [Policy wording](#policy-wording)
    - [Variable and policy name](#variable-and-policy-name)
    - [Policy description](#policy-description)
    - [Enforcement level](#enforcement-level)
    - [Policy code](#policy-code)
    - [Policy additional information](#policy-additional-information)
    - [Documentation string](#documentation-string)

## Policy location

A new policy should be stored in the correct location. For example, if a policy validates `aws.ec2.LaunchConfiguration`, it then yould be stored in `aws/ec2/launchConfiguration.ts`. See the [project structure](../project-structure.md) above.

In short, this can be summarized as follows:

* All folders are lower case. `aws`, `ec2`, or `kubernetes`, `apps`, `v1`
* The policy is stored in a file named (**⚠️ camel case**) after the resource name
  * `instance.ts` for `aws.ec2.Instance`
  * `launchConfiguration.ts` for `aws.ec2.LaunchConfiguration`
  * `replicaSet.ts` for `kubernetes.apps.v1.ReplicaSet`

## File header

The file header should always include Pulumi's copyright and code license.

```ts
// Copyright 2016-2022, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
```

## Default imports

A few imports are usually required when a new policy file is created.

```ts
import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyRegistrations } from "../../utils";
```

Note: `policyRegistrations` is a utility library to assist in managing individual policy throughout this package. As described below, all policies should be registered.

## Policy registration

The example below is an example of a valid policy.

```ts
/**
 * Checks that EC2 instances do not have public IP addresses.
 *
 * @severity **High**
 */
export const disallowPublicIP: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-instance-disallow-public-ip",
        description: "Checks that EC2 instances do not have a public IP address.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ec2.Instance, (instance, args, reportViolation) => {
            if (instance.associatePublicIpAddress === undefined || instance.associatePublicIpAddress === true) {
                reportViolation("EC2 Instances should not have a public IP address.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["network"],
});
```

First, a new policy is always registered using `policyRegistrations.registerPolicy()` (See the [registration framework](#registration-framework) for more details) and the return value is `export`ed as a variable.

## Coding guide

Below is a list of con

### Policy wording

Single Boolean > disallow

Enable and Configure

Configure => bag of options but is set to undefined
Enable => Boolean


### Variable and policy name

* The exported variable is camel case and matching the policy `name` without the resource path (`aws-ec2-instance-disallow-public-ip` => `disallowPublicIP`)
* The policy name must be unique, so
  * We use the following scheme `vendor`-`path`-`to`-`resource`-`single`-`worded`-`polic-`-`name`
  * All words are lower-case
* The Policy name should be singular as the policy operates in a single resource at a time

### Policy description

The policy description should be made of at least one sentence (Starts with an upper-case letter and ends with a period). It should follow the [policy wording](#policy-wording) described above.

### Enforcement level

The enforcement level is always set to `advisory` so it never impacts a customer deployment.

### Policy code

To help write better policies, it's important ⚠️:

* to test only one resource property at a time
* to avoid overlapping policies with one another

✅ This means the customer won't have 2 violation reports for the same resource.

This is relatively easy to achive for `boolean` properties, especially when changing the value doesn't require other properties to be set.

However, this becomes more difficult to achieve for more complex resources. Here is a example below.

```ts
// Policy #1
/* ... */
if (!fileSystem.encrypted) {
    reportViolation("EFS File systems should not have an unencypted file system.");
}


//Policy #2
/* ... */
if (fileSystem.encrypted && !fileSystem.kmsKeyId) {
    reportViolation("An EFS File System should be encrypted using a customer-managed KMS key.");
}
```

Refer to the [policy wording](#policy-wording) above as a guide.

### Policy additional information

When registering a new policy, the policy auther should also provide additional information:

* `vendors[]` which represents the name of the resource provider. ⚠️ Only a single vendor name should be provided.
* `services[]` which is the service associated with the resource. ⚠️ Only a single service name should be provided.
* `severity` describes the severity of the policy. Values are `low`, `medium`, `high` and `critical`
* `topics[]` each topic is an arbitrary string related to the policy itself. It's later used to group policies into packs based on specific topics like `encryption`, `storage`, `network` and so on.
* `frameworks[]` each value represents a possible compliance framework related to the policy

### Documentation string

When writing a new policy, it should be accompanied with a documentation string as shown in the example above.

The description should match the policy description and should form a full sentence.

Additionnally, 2 tags are required:

* `@severity` which should match the policy registered `severity`
* `@link` a valid hyperlink to some vendor specific documentation
