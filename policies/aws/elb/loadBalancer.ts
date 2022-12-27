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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "../../utils";

/**
 * Check that ELB Load Balancers do not allow unencrypted (HTTP) traffic.
 *
 * @severity **Critical**
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-https-load-balancers.html
 */
export const disallowUnencryptedTraffic: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-load-balancer-disallow-unencrypted-traffic",
        description: "Check that ELB Load Balancers do not allow unencrypted (HTTP) traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.elb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            loadBalancer.listeners.forEach((listener) => {
                if (listener.lbProtocol.toLowerCase() === "http") {
                    reportViolation("ELB Load Balancers should now allow unencrypted (HTTP) traffic.");
                }
            });
        }),
    },
    vendors: ["aws"],
    services: ["elb"],
    severity: "critical",
    topics: ["network"],
});

/**
 * Check that ELB Load Balancers uses more than one availability zone.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/enable-disable-az.html
 */
export const configureMultiAvailabilityZone: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-load-balancer-configure-multi-availability-zone",
        description: "Check that ELB Load Balancers uses more than one availability zone.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.elb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (!loadBalancer.availabilityZones || loadBalancer.availabilityZones.length < 2) {
                reportViolation("ELB Load Balancers should use more than one availability zone.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["elb"],
    severity: "high",
    topics: ["network", "availability"],
});

/**
 * Check that ELB Load Balancers uses access logging.
 *
 * @severity **Medium**
 * @ link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/access-log-collection.html
 */
export const configureAccessLogging: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-load-balancer-configure-access-logging",
        description: "Check that ELB Load Balancers uses access logging.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.elb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (!loadBalancer.accessLogs || loadBalancer.accessLogs.enabled === false) {
                reportViolation("ELB Load Balancers should have access logging enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["elb"],
    severity: "medium",
    topics: ["network", "logging"],
});

/**
 * Check that ELB Load Balancers have a health check enabled.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-healthchecks.html
 */
export const enableHealthCheck: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-load-balancer-enable-health-check",
        description: "Check that ELB Load Balancers have a health check enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.elb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (!loadBalancer.healthCheck) {
                reportViolation("ELB Load Balancers should have health checks enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["elb"],
    severity: "high",
    topics: ["network", "availability"],
});
