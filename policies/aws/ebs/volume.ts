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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";

/**
 * @description Checks that no EBS is unencrypted.
 */
export const volumeNoUnencryptedVolume: ResourceValidationPolicy = {
    name: "aws-ebs-volume-disallow-unencrypted-volume",
    description: "Checks that no EBS is unencrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ebs.Volume, (v, args, reportViolation) => {
        if (!v.encrypted) {
            reportViolation("An EBS volume is not encrypted.");
        }
    }),
};

/**
 * @description Check that encrypted EBS volume uses a customer-managed KMS key.
 */
export const volumeWithCustomerManagedKey: ResourceValidationPolicy = {
    name: "aws-ebs-volume-disallow-volume-without-customer-managed-key",
    description: "Check that encrypted EBS volume uses a customer-manager KMS key.",
    validateResource: validateResourceOfType(aws.ebs.Volume, (v, args, reportViolation) => {
        if (!v.encrypted || v.kmsKeyId !== undefined) {
            reportViolation("An EBS volume should be encrypted with a customer-managed KMS key.");
        }
    }),
};
