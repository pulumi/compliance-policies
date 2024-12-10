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
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that ALB Load Balancers uses secure/modern TLS encryption.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics encryption, network
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/application/describe-ssl-policies.html
 */
export const configureSecureTls: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-alb-listener-configure-secure-tls",
        description: "Checks that ALB Load Balancers uses secure/modern TLS encryption.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Listener, (listener, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if ((listener.port && listener.port === 443) || (listener.protocol && listener.protocol === "HTTPS")) {
                if (!listener.sslPolicy || ! (
                    listener.sslPolicy.includes("ELBSecurityPolicy-TLS13-1-2-2021-06") || listener.sslPolicy.includes("ELBSecurityPolicy-TLS13-1-3-2021-06") ||             // TLS security policies
                    listener.sslPolicy.includes("ELBSecurityPolicy-TLS13-1-3-FIPS-2023-04") || listener.sslPolicy.includes("ELBSecurityPolicy-TLS13-1-2-FIPS-2023-04") ||   // FIPS security policies
                    listener.sslPolicy.includes("ELBSecurityPolicy-FS-1-2-Res-2020-10") || listener.sslPolicy.includes("ELBSecurityPolicy-FS-1-2-Res-2019-08")              // FS supported policies
                )) {
                    reportViolation("ALB Load Balancers should use secure/modern TLS encryption.");
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
