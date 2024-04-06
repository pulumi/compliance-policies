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
 * Checks that CloudFront distributions communicate with custom origins using TLS 1.2 encryption only.
 *
 * @severity high
 * @frameworks hitrust, iso27001, pcidss
 * @topics encryption, network
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-s3-origin.html
 */
export const configureSecureTlsToOrigin: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-cloudfront-distribution-configure-secure-tls-to-origin",
        description: "Checks that CloudFront distributions communicate with custom origins using TLS 1.2 encryption only.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Distribution, (distribution, args, reportViolation) => {
            distribution.origins.forEach((origin) => {
                origin.customOriginConfig?.originSslProtocols?.forEach((sslProtocol) => {
                    if (sslProtocol.toLowerCase() !== "TLSv1.2".toLowerCase()) {
                        reportViolation("CloudFront Distributions should only use TLS 1.2 encryption to communicate with custom origins.");
                    }
                });
            });
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "high",
    topics: ["network", "encryption"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
