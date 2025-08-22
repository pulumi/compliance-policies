// Copyright 2016-2025, Pulumi Corporation.
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
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Enforces EC2 Launch Templates to use IMDSv2 by requiring httpTokens='required'
 * whenever the Instance Metadata Service endpoint is enabled.
 * Disabling the IMDS endpoint is also allowed.
 *
 * @severity high
 * @frameworks cis, iso27001, pcidss, hitrust
 * @topics hardening, network
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html
 */
export const enforceImdsv2: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-launchtemplate-enforce-imdsv2",
        description: "Ensures EC2 Launch Templates require IMDSv2 (httpTokens='required') or disable the IMDS endpoint.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "mandatory",
        validateResource: validateResourceOfType(LaunchTemplate, (lt, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            const md = lt.metadataOptions;

            // If metadataOptions not provided, defaults allow IMDSv1. Violation.
            if (!md) {
                reportViolation(
                    "EC2 Launch Templates must configure metadataOptions.httpTokens='required' to enforce IMDSv2, or disable the metadata endpoint."
                );
                return;
            }

            // If IMDS endpoint is disabled, it's compliant.
            if (md.httpEndpoint === "disabled") {
                return;
            }

            // With endpoint enabled (default or explicitly enabled), tokens must be required.
            if (md.httpTokens !== "required") {
                reportViolation(
                    "EC2 Launch Templates must set metadataOptions.httpTokens='required' to enforce IMDSv2."
                );
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["hardening", "network"],
    frameworks: ["cis", "pcidss", "hitrust", "iso27001"],
});
