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

import { Distribution } from "@pulumi/aws-native/cloudfront";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that CloudFront distributions have a WAF ACL associated.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics network
 * @link https://docs.aws.amazon.com/waf/latest/developerguide/cloudfront-features.html
 */
export const configureWafAcl: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-cloudfront-distribution-configure-waf-acl",
        description: "Checks that CloudFront distributions have a WAF ACL associated.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Distribution, (distribution, args, reportViolation) => {
            if (!distribution.distributionConfig.webAclId) {
                reportViolation("CloudFront Distributions should have a WAF ACL associated.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "high",
    topics: ["network"],
    frameworks: ["pcidss", "iso27001"],
});
