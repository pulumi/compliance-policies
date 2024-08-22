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
import { policyManager } from "@pulumi/compliance-policy-manager";
import { Cluster } from "@pulumi/google-native/redis/v1beta1";

/**
 * Disallow the use of non-stable (Beta) resouces (redis.v1beta1.Cluster).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-redis-v1beta1-cluster-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (redis.v1beta1.Cluster).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Cluster, (_, args, reportViolation) => {
            reportViolation("Redis Cluster shouldn't use an unstable API (redis.v1beta1.Cluster).");
        }),
    },
    vendors: ["google"],
    services: ["redis"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
