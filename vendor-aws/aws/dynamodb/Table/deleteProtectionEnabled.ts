import { Table } from "@pulumi/aws/dynamodb";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Requires DynamoDB tables to have deletion protection enabled.
 *
 * @severity high
 * @topics resilience, deletion-protection
 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DeletionProtection.html
 */
export const deleteProtectionEnabled: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-dynamodb-table-delete-protection-enabled",
        description: "Requires DynamoDB tables to have deletion protection enabled.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "mandatory",
        validateResource: validateResourceOfType(Table, (table, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (!table.deletionProtectionEnabled) {
                reportViolation("DynamoDB Table must have deletion protection enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["dynamodb"],
    severity: "high",
    topics: ["resilience", "deletion-protection"],
});