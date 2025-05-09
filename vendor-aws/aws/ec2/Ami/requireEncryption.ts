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

import { Ami } from "@pulumi/aws/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that Amazon Machine Images (AMIs) have encryption enabled for all EBS block devices.
 *
 * @severity high
 * @frameworks cis, pcidss, hitrust, iso27001
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html
 */
export const requireEncryption: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-ami-require-encryption",
        description: "Ensures Amazon Machine Images (AMIs) are encrypted.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Ami, (ami, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (ami.ebsBlockDevices) {
                for (const device of ami.ebsBlockDevices) {
                    if (device.encrypted === undefined || device.encrypted === false) {
                        reportViolation("Amazon Machine Images (AMIs) should have encryption enabled for all EBS block devices.");
                        break;
                    }
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["encryption", "storage"],
    frameworks: ["cis", "pcidss", "hitrust", "iso27001"],
});