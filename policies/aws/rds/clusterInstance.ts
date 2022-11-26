import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

/**
 * @description Checks that RDS Cluster has performance insights enabled.
 */
export const clusterInstancePerformanceInsights: ResourceValidationPolicy = {
    name: "aws-rds-cluster-instance-performance-insights-enabled",
    description: "Checks that RDS has performance insights enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.ClusterInstance, (clusterInstance, args, reportViolation) => {
        if (!clusterInstance.performanceInsightsEnabled) {
            reportViolation("RDS Cluster Instances should have performance insights enabled.");
        }
    }),
};

/**
 * @description Checks that performance insights in RDS Cluster is encrypted.
 */
export const clusterInstancePerformanceInsightsEncrypted: ResourceValidationPolicy = {
    name: "aws-rds-cluster-instance-performance-insights-encrypted",
    description: "Checks that performance insights in RDS is encrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.ClusterInstance, (clusterInstance, args, reportViolation) => {
        if (clusterInstance.performanceInsightsEnabled && clusterInstance.performanceInsightsKmsKeyId === undefined) {
            reportViolation("RDS Cluster Instances should have performance insights encrypted.");
        }
    }),
};

/**
 * @description Checks that public access is not enabled on RDS Instances.
 */
export const clusterInstancePublicAccess: ResourceValidationPolicy = {
    name: "aws-rds-cluster-instance-disallow-public-access",
    description: "Checks that public access is not enabled on RDS Instances.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.ClusterInstance, (clusterInstance, args, reportViolation) => {
        if (!clusterInstance.publiclyAccessible) {
            reportViolation("RDS Cluster Instances should not be created with public access enabled.");
        }
    }),
};