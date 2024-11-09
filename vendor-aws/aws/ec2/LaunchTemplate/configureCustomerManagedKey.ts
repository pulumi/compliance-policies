// Copyright 2016-2024, Pulumi Corporation.
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

import { LaunchTemplate } from "@pulumi/aws/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager, valToBoolean } from "@pulumi/compliance-policy-manager";

/**
 * Check that encrypted EBS volume uses a customer-managed KMS key.
 *
 * @severity low
 * @frameworks hitrust, iso27001, pcidss
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-launchtemplate-configure-customer-managed-key",
        description: "Check that encrypted EBS volume uses a customer-managed KMS key.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(LaunchTemplate, (lt, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (lt.blockDeviceMappings) {
                lt.blockDeviceMappings.forEach((blockDevice) => {
                    // see https://github.com/pulumi/pulumi-aws/issues/2257
                    if (blockDevice.ebs && valToBoolean(blockDevice.ebs.encrypted) && !blockDevice.ebs.kmsKeyId) {
                        reportViolation("EC2 Launch Templates should not have encrypted block device using a customer-managed KMS key.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "low",
    topics: ["encryption", "storage"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
