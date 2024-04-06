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

import { Distribution } from "@pulumi/aws/cloudfront";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that any CloudFront distributions have access logging configured.
 *
 * @severity medium
 * @frameworks hitrust, iso27001, pcidss
 * @topics logging, network
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html
 */
export const configureAccessLogging: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-cloudfront-distribution-configure-access-logging",
        description: "Checks that any CloudFront distributions have access logging configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Distribution, (distribution, args, reportViolation) => {
            if (distribution.loggingConfig && !distribution.loggingConfig.bucket) {
                reportViolation("CloudFront Distributions should have access logging configured.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "medium",
    topics: ["network", "logging"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
