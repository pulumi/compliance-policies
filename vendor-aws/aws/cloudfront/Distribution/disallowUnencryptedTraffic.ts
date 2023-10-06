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
 * Checks that CloudFront distributions only allow encypted ingress traffic.
 *
 * @severity critical
 * @frameworks iso27001, pcidss
 * @topics network
 * @link https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
 */
export const disallowUnencryptedTraffic: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-cloudfront-distribution-disallow-unencrypted-traffic",
        description: "Checks that CloudFront distributions only allow encypted ingress traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Distribution, (distribution, args, reportViolation) => {
            if (distribution.defaultCacheBehavior.viewerProtocolPolicy.toLowerCase() === "allow-all") {
                reportViolation("CloudFront distributions should not allow unencrypted traffic.");
            }
            if (distribution.orderedCacheBehaviors?.some((orderedCacheBehavior) => orderedCacheBehavior.viewerProtocolPolicy.toLowerCase() === "allow-all")) {
                reportViolation("CloudFront distributions should not allow unencrypted traffic.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "critical",
    topics: ["network"],
    frameworks: ["pcidss", "iso27001"],
});
