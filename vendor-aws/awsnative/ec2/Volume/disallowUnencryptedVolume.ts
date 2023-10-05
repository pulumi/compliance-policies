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

import { Volume } from "@pulumi/aws-native/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/policy-manager";

/**
 * Checks that EBS volumes are encrypted.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
export const disallowUnencryptedVolume: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-ec2-volume-disallow-unencrypted-volume",
        description: "Checks that EBS volumes are encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Volume, (v, args, reportViolation) => {
            if (!v.encrypted) {
                reportViolation("An EBS volume is currently not encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ebs"],
    severity: "high",
    topics: ["encryption", "storage"],
    frameworks: ["pcidss", "iso27001"],
});
