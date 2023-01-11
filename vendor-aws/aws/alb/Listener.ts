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
 * Check that ALB Load Balancers do not allow unencrypted (HTTP) traffic.
 *
 * @severity Critical
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html
 */
export const disallowUnencryptedTraffic: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-alb-listener-disallow-unencrypted-traffic",
        description: "Check that ALB Load Balancers do not allow unencrypted (HTTP) traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.alb.Listener, (listener, args, reportViolation) => {
            if ((listener.port && listener.port === 80) || (listener.protocol && listener.protocol === "HTTP")) {
                reportViolation("ALB Load Balancers should now allow unencrypted (HTTP) traffic.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["alb"],
    severity: "critical",
    topics: ["network"],
});

/**
 * Checks that ALB Load Balancers uses secure/modern TLS encryption.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html#describe-ssl-policies
 */
export const configureSecureTls: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-alb-listener-configure-secure-tls",
        description: "Checks that ALB Load Balancers uses secure/modern TLS encryption.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.alb.Listener, (listener, args, reportViolation) => {
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
});
