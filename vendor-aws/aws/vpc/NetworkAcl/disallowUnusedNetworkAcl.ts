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

import { StackValidationPolicy, ResourceValidationPolicy } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

export const disallowUnusedNetworkAclStackPolicy: StackValidationPolicy = {
    name: "aws-vpc-networkacl-disallow-unused-network-acl",
    description: "Checks if there are unused network ACLs in your Amazon VPC.",
    enforcementLevel: "advisory",
    validateStack: (args, reportViolation) => {
        // Find all Network ACLs in the stack
        const networkAcls = args.resources.filter(r => r.type === "aws:ec2/networkAcl:NetworkAcl");

        // If no Network ACLs in the stack, there's nothing to evaluate
        if (networkAcls.length === 0) {
            return;
        }

        // Find all Network ACL Associations in the stack
        const aclAssociations = args.resources.filter(r => r.type === "aws:ec2/networkAclAssociation:NetworkAclAssociation");

        // Look for network ACLs that don't have any associations with subnets
        for (const acl of networkAcls) {
            const aclId = acl.props.id;
            const aclName = acl.props.tags?.Name || acl.props.name || acl.props.id || acl.urn;

            // Skip Default ACLs - they're typically attached to the default subnet already
            const props = acl.props || {};
            if (props.default === true) {
                continue;
            }

            // Check if this ACL is associated with any subnet
            const isUsed = aclAssociations.some(assoc => {
                const assocProps = assoc.props || {};
                return assocProps.networkAclId === aclId;
            });

            // Check if there's a subnetId directly in the ACL props (for some implementations)
            const hasDirectAssociation = Array.isArray(props.subnetIds) && props.subnetIds.length > 0;

            // If the ACL isn't associated with any subnet, report a violation
            if (!isUsed && !hasDirectAssociation) {
                reportViolation(
                    `Network ACL '${aclName}' is not associated with any subnet. ` +
					"Unused network ACLs should be removed to maintain a clean and manageable environment. " +
					"Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-network-acl-unused-check.html"
                );
            }
        }
    },
};

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
        validateResource: () => {
            // This is a stack-level policy, not a resource-level policy
            // The actual validation logic is in disallowUnusedNetworkAclStackPolicy
        },
    },
    vendors: ["aws"],
    services: ["vpc"],
    severity: "low",
    topics: ["network", "security"],
    frameworks: ["cis", "nist800-53"],
});
