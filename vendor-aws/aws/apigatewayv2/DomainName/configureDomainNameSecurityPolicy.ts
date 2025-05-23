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

import { DomainName } from "@pulumi/aws/apigatewayv2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that any ApiGatewayV2 Domain Name Security Policy uses secure/modern TLS encryption.
 *
 * @severity high
 * @frameworks hitrust, iso27001, pcidss
 * @topics encryption, network
 * @link https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html
 */
export const configureDomainNameSecurityPolicy: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-apigatewayv2-domainname-configure-domain-name-security-policy",
        description: "Checks that any ApiGatewayV2 Domain Name Security Policy uses secure/modern TLS encryption.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(DomainName, (domainName, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (domainName.domainNameConfiguration && domainName.domainNameConfiguration.securityPolicy !== "TLS_1_2") {
                reportViolation("API GatewayV2 Domain Name Security Policy should use secure/modern TLS encryption.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["apigatewayv2"],
    severity: "high",
    topics: ["network", "encryption"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
