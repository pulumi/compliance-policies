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

import { Listener } from "@pulumi/aws/alb";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that ALB Load Balancers uses secure/modern TLS encryption.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics encryption, network
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html#describe-ssl-policies
 */
export const configureSecureTls: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-alb-listener-configure-secure-tls",
        description: "Checks that ALB Load Balancers uses secure/modern TLS encryption.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Listener, (listener, args, reportViolation) => {
            if ((listener.port && listener.port === 443) || (listener.protocol && listener.protocol === "HTTPS")) {
                if (!listener.sslPolicy || !listener.sslPolicy.includes("ELBSecurityPolicy-FS-1-2")) {
                    reportViolation("ALB Load Balancers should use secure/modern TLS encryption with forward secrecy.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["alb"],
    severity: "high",
    topics: ["network", "encryption"],
    frameworks: ["pcidss", "iso27001"],
});
