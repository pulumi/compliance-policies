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

import "mocha";
import { assertHasRegisteredPolicies, assertHasRemainingPolicies, assertHasAllRemainingPolicies, assertExpectedRemainingPolicyCount, assertNoDoubleSelection, assertSelectionEnforcementLevel } from "@pulumi/compliance-policies-unit-test-helpers";
import { policyManager } from "@pulumi/compliance-policy-manager";

describe("policyManager.general", function() {

    it("#1", async function() {
        assertHasRegisteredPolicies();
    });

    it("#2", async function() {
        assertHasRemainingPolicies();
    });

    /*
     * After all policies have been registered, the number of
     * policies should be equal to the number of remaining ones.
     */
    it("#3", async function() {
        assertHasAllRemainingPolicies();
    });

    it("#4", async function() {
        policyManager.resetPolicySelector();
        assertHasAllRemainingPolicies();
    });

    /*
     * After selecting the EC2 policies, other polices Should
     * still be present in the pool. This will likely fail when
     * policies are stored in their own npm packages though.
     */
    it("#5", async function() {
        const policiesStats = policyManager.getSelectionStats();
        const selection = policyManager.selectPolicies({
            services: ["ec2"],
        });
        assertHasRemainingPolicies();
        assertExpectedRemainingPolicyCount(policiesStats.policyCount - selection.length);
    });

    it("#6", async function() {
        const policiesStats = policyManager.getSelectionStats();
        policyManager.resetPolicySelector();
        assertHasAllRemainingPolicies();
        assertExpectedRemainingPolicyCount(policiesStats.policyCount);
    });

    it("#7", async function() {
        assertNoDoubleSelection({
            vendors: ["aws"],
        });
    });

    it("#8", async function() {
        assertNoDoubleSelection({
            vendors: ["aws"],
            services: ["ec2"],
        });
    });

    it("#9", async function() {
        assertNoDoubleSelection({
            severities: ["low", "critical"],
        });
    });

    it("#10", async function() {
        assertSelectionEnforcementLevel({
            severities: ["low", "high"],
        },
        "mandatory");
    });

});
