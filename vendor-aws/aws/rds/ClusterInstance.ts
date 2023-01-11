// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that RDS Cluster Instances have performance insights enabled.
 *
 * @severity Low
 * @link https://aws.amazon.com/rds/performance-insights/
 */
export const enablePerformanceInsights: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-clusterinstance-enable-performance-insights",
        description: "Checks that RDS Cluster Instances have performance insights enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.ClusterInstance, (clusterInstance, args, reportViolation) => {
            if (!clusterInstance.performanceInsightsEnabled) {
                reportViolation("RDS Cluster Instances should have performance insights enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["logging", "performance"],
});

/**
 * Checks that RDS Cluster Instances performance insights is encrypted.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const disallowUnencryptedPerformanceInsights: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-clusterinstance-disallow-unencrypted-performance-insights",
        description: "Checks that RDS Cluster Instances performance insights is encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.ClusterInstance, (clusterInstance, args, reportViolation) => {
            if (clusterInstance.performanceInsightsEnabled && !clusterInstance.performanceInsightsKmsKeyId) {
                reportViolation("RDS Cluster Instances should have performance insights encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that RDS Cluster Instances public access is not enabled.
 *
 * @severity Critical
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.Connect.html
 */
export const disallowPublicAccess: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-clusterinstance-disallow-public-access",
        description: "Checks that RDS Cluster Instances public access is not enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.ClusterInstance, (clusterInstance, args, reportViolation) => {
            if (clusterInstance.publiclyAccessible) {
                reportViolation("RDS Cluster Instances public access should not be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "critical",
    topics: ["network"],
});
