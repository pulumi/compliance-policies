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

/**
 * Checks that RDS Cluster has performance insights enabled.
 *
 * @severity **Low**
 * @link https://aws.amazon.com/rds/performance-insights/
 */
export const performanceInsights: ResourceValidationPolicy = {
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
 * Checks that performance insights in RDS Cluster is encrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const performanceInsightsEncrypted: ResourceValidationPolicy = {
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
 * Checks that public access is not enabled on RDS Instances.
 *
 * @severity **Critical**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.Connect.html
 */
export const publicAccess: ResourceValidationPolicy = {
    name: "aws-rds-cluster-instance-disallow-public-access",
    description: "Checks that public access is not enabled on RDS Instances.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.ClusterInstance, (clusterInstance, args, reportViolation) => {
        if (!clusterInstance.publiclyAccessible) {
            reportViolation("RDS Cluster Instances should not be created with public access enabled.");
        }
    }),
};
