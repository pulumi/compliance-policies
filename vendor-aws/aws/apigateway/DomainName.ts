// Copyright 2016-2023, Pulumi Corporation.
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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that ApiGateway Domain Name Security Policy uses secure/modern TLS encryption.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html
 */
export const configureSecurityPolicy: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-apigateway-domainname-configure-security-policy",
        description: "Checks that ApiGateway Domain Name Security Policy uses secure/modern TLS encryption.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.apigateway.DomainName, (domainName, args, reportViolation) => {
            if (!domainName.securityPolicy || domainName.securityPolicy !== "TLS_1_2") {
                reportViolation("API Gateway Domain Name Security Policy should use secure/modern TLS encryption.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["apigateway"],
    severity: "high",
    topics: ["network", "encryption"],
});
