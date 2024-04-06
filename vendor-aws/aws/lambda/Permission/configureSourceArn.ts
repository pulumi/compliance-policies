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

import { Permission } from "@pulumi/aws/lambda";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that lambda function permissions have a source arn specified.
 *
 * @severity critical
 * @frameworks hitrust, iso27001, pcidss
 * @topics permissions, security
 * @link https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-permission.html
 */
export const configureSourceArn: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-lambda-permission-configure-source-arn",
        description: "Checks that lambda function permissions have a source arn specified.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Permission, (f, args, reportViolation) => {
            if (!f.sourceArn) {
                reportViolation("Lambda functions permissions should have a source ARN defined.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["lambda"],
    severity: "critical",
    topics: ["permissions", "security"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
