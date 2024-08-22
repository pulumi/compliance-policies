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
 * Default imports for a policy unit test.
 */
import "mocha";
import {
    assertHasResourceViolation,
    assertNoResourceViolations,
    assertResourcePolicyIsRegistered,
    assertResourcePolicyRegistrationDetails,
    assertResourcePolicyName,
    assertResourcePolicyEnforcementLevel,
    assertResourcePolicyDescription,
    assertCodeQuality,
} from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../../index";
import { getResourceValidationArgs } from "./resource";

describe("googlenative.iap.v1beta1.V1beta1IamBinding.disallowBetaResource", function () {
    const policy = policies.googlenative.iap.v1beta1.V1beta1IamBinding.disallowBetaResource;

    it("name", async function () {
        assertResourcePolicyName(policy, "googlenative-iap-v1beta1-v1beta1iambinding-disallow-beta-resource");
    });

    it("registration", async function () {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function () {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["google"],
            services: ["iap"],
            severity: "medium",
            topics: ["api", "unstable", "beta"],
        });
    });

    it("enforcementLevel", async function () {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function () {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("#1", async function () {
        const args = getResourceValidationArgs();
        await assertHasResourceViolation(policy, args, { message: "Iap V1beta1IamBinding shouldn't use an unstable API (iap.v1beta1.V1beta1IamBinding)." });
    });
});
