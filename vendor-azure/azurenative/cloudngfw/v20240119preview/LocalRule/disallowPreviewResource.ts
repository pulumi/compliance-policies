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
import { LocalRule } from "@pulumi/azure-native/cloudngfw/v20240119preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (cloudngfw.v20240119preview.LocalRule).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-cloudngfw-v20240119preview-localrule-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (cloudngfw.v20240119preview.LocalRule).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(LocalRule, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation("Azure LocalRule shouldn't use an unstable API (cloudngfw.v20240119preview.LocalRule). A compatible replacement can be found at 'cloudngfw.LocalRule'.");
        }),
    },
    vendors: ["azure"],
    services: ["cloudngfw"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
