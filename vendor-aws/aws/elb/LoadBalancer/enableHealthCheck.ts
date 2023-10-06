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

import { LoadBalancer } from "@pulumi/aws/elb";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Check that ELB Load Balancers have a health check enabled.
 *
 * @severity high
 * @frameworks none
 * @topics availability, network
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-healthchecks.html
 */
export const enableHealthCheck: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-loadbalancer-enable-health-check",
        description: "Check that ELB Load Balancers have a health check enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(LoadBalancer, (loadBalancer, args, reportViolation) => {
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
