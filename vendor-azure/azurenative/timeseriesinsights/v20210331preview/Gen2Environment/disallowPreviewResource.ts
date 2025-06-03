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
import { Gen2Environment } from "@pulumi/azure-native/timeseriesinsights/v20210331preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (timeseriesinsights.v20210331preview.Gen2Environment).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-timeseriesinsights-v20210331preview-gen2environment-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (timeseriesinsights.v20210331preview.Gen2Environment).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Gen2Environment, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation(
                "Azure Gen2Environment shouldn't use an unstable API (timeseriesinsights.v20210331preview.Gen2Environment). A compatible replacement can be found at 'timeseriesinsights.Gen2Environment'."
            );
        }),
    },
    vendors: ["azure"],
    services: ["timeseriesinsights"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
