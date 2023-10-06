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

import { CronJob } from "@pulumi/kubernetes/batch/v1";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that Kubernetes CronJobs run pods with a read-only filesystem.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics runtime, security
 * @link https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
 */
export const enableReadOnlyRootFilesystem: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-batch-v1-cronjob-enable-read-only-root-filesystem",
        description: "Checks that Kubernetes CronJobs run pods with a read-only filesystem.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(CronJob, (cronJob, args, reportViolation) => {
            if (cronJob.spec && cronJob.spec.jobTemplate.spec && cronJob.spec.jobTemplate.spec.template.spec && cronJob.spec.jobTemplate.spec.template.spec.containers.length > 0) {
                cronJob.spec.jobTemplate.spec.template.spec.containers.forEach((container) => {
                    if (!container.securityContext || !container.securityContext.readOnlyRootFilesystem) {
                        reportViolation("Kubernetes CronJobs should run their pods using a read-only filesystem.");
                    }
                });
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["batch"],
    severity: "high",
    topics: ["runtime", "security"],
    frameworks: ["pcidss", "iso27001"],
});
