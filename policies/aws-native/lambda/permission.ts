// Copyright 2016-2022, Pulumi Corporation.
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

import * as awsnative from "@pulumi/aws-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyRegistrations } from "../../utils";

/**
 * Checks that lambda function permissions have a source arn specified.
 *
 * @severity **Critical**
 * @link https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws_native-resource-lambda-permission.html
 */
export const configureSourceArn: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-lambda-permission-configure-source-arn-permission",
        description: "Checks that lambda function permissions have a source arn specified.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.lambda.Permission, (f, args, reportViolation) => {
            if (!f.sourceArn) {
                reportViolation("Lambda functions permissions should have a source ARN defined.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["lambda"],
    severity: "critical",
    topics: ["permissions", "security"],
});
