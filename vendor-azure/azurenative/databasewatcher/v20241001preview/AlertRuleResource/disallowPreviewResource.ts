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

/**
 * Default imports for a policy.
 */
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";
import { AlertRuleResource } from "@pulumi/azure-native/databasewatcher/v20241001preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (databasewatcher.v20241001preview.AlertRuleResource).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-databasewatcher-v20241001preview-alertruleresource-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (databasewatcher.v20241001preview.AlertRuleResource).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(AlertRuleResource, (_, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation(
                "Azure AlertRuleResource shouldn't use an unstable API (databasewatcher.v20241001preview.AlertRuleResource). A compatible replacement can be found at 'databasewatcher.AlertRuleResource'."
            );
        }),
    },
    vendors: ["azure"],
    services: ["databasewatcher"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
