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
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import { CertificateAuthorityIamPolicy } from "@pulumi/google-native/privateca/v1beta1";

/**
 * Disallow the use of non-stable (Beta) resouces (privateca.v1beta1.CertificateAuthorityIamPolicy).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-privateca-v1beta1-certificateauthorityiampolicy-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (privateca.v1beta1.CertificateAuthorityIamPolicy).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(CertificateAuthorityIamPolicy, (_, args, reportViolation) => {
            reportViolation("Privateca CertificateAuthorityIamPolicy shouldn't use an unstable API (privateca.v1beta1.CertificateAuthorityIamPolicy).");
        }),
    },
    vendors: ["google"],
    services: ["privateca"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
