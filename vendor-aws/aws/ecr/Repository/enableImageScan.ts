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

import { Repository } from "@pulumi/aws/ecr";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that ECR repositories have 'scan-on-push' enabled.
 *
 * @severity high
 * @frameworks hitrust, iso27001, pcidss
 * @topics container, vulnerability
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html
 */
export const enableImageScan: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecr-repository-enable-image-scan",
        description: "Checks that ECR repositories have 'scan-on-push' enabled.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Repository, (repo, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (repo.imageScanningConfiguration && !repo.imageScanningConfiguration.scanOnPush) {
                reportViolation("ECR Repositories should enable 'scan-on-push'.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecr"],
    severity: "high",
    topics: ["container", "vulnerability"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
