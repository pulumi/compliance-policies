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

import { NetworkAcl } from "@pulumi/aws/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks if there are unused network ACLs in your Amazon VPC.
 *
 * @severity low
 * @frameworks cis, nist800-53
 * @topics network, security
 * @link https://docs.aws.amazon.com/config/latest/developerguide/vpc-network-acl-unused-check.html
 */
export const disallowUnusedNetworkAcl: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-vpc-networkacl-disallow-unused-network-acl",
        description: "Checks if there are unused network ACLs in your Amazon VPC.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(NetworkAcl, (networkAcl, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            // Skip Default ACLs - they're typically attached to the default subnet already
            if (networkAcl.tags?.default === "true" || (networkAcl.tags?.default as any) === true) {
                return;
            }

            // To check if this ACL is unused, we need to look at the stack context
            // Since this is a resource-level validation, we need to check associations in a different way

            // Check if there's a subnetIds property directly on the ACL
            if (Array.isArray(networkAcl.subnetIds) && networkAcl.subnetIds.length > 0) {
                return; // ACL has direct subnet associations
            }

            // For this implementation, we'll assume an ACL is unused if it doesn't have subnetIds
            // In a real-world scenario, you might need additional logic to check associations
            // This is a simplified version that works with the resource validation pattern

            const aclName = networkAcl.tags?.Name || args.urn || "unknown";
            reportViolation(
                `Network ACL '${aclName}' appears to be unused (no subnet associations found). ` +
                "Unused network ACLs should be removed to maintain a clean and manageable environment. " +
                "Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-network-acl-unused-check.html"
            );
        }),
    },
    vendors: ["aws"],
    services: ["vpc"],
    severity: "low",
    topics: ["network", "security"],
    frameworks: ["cis", "nist800-53"],
});
