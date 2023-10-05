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

/**
 * Default imports for a policy.
 */
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/policy-manager";
import { CronJob } from "@pulumi/kubernetes/batch/v2alpha1";

/**
 * Disallow the use of non-stable (Alpha) Kubernetes resouces (batch.v2alpha1.CronJob).
 *
 * @severity medium
 * @frameworks none
 * @topics alpha, api, unstable
 * @link https://kubernetes.io/docs/concepts/overview/kubernetes-api/#api-groups-and-versioning
 */
export const disallowAlphaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-batch-v2alpha1-cronjob-disallow-alpha-resource",
        description: "Disallow the use of non-stable (Alpha) Kubernetes resouces (batch.v2alpha1.CronJob).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(CronJob, (_, args, reportViolation) => {
            reportViolation("Kubernetes CronJob shouldn't use an unstable API (batch.v2alpha1.CronJob).");
        }),
    },
    vendors: ["kubernetes"],
    services: ["batch"],
    severity: "medium",
    topics: ["api", "unstable", "alpha"],
});
