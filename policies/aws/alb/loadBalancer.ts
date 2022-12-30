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
import { policiesManagement } from "../../utils";

/**
 * Checks that ALB loadbalancer have access logging enabled.
 *
 * @severity medium
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html
 */
export const enableAccessLogging: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-alb-loadbalancer-enable-access-logging",
        description: "Checks that ALB loadbalancers have access logging enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.alb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (!loadBalancer.accessLogs) {
                reportViolation("ALB LoadBalancers should have access logging enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["alb"],
    severity: "medium",
    topics: ["network", "logging"],
});

/**
 * Checks that ALB loadbalancers have access logging configured and enabled.
 *
 * @severity medium
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html
 */
export const configureAccessLogging: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-alb-loadbalancer-configure-access-logging",
        description: "Checks that ALB loadbalancers have access logging configured and enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.alb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (loadBalancer.accessLogs && (!loadBalancer.accessLogs.enabled || !loadBalancer.accessLogs.bucket)) {
                reportViolation("ALB LoadBalancers should have access logging configured and enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["alb"],
    severity: "medium",
    topics: ["network", "logging"],
});
