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

import "mocha";
import { assertHasRegisteredPolicies, assertHasRemainingPolicies, assertHasAllRemainingPolicies, assertExpectedRemainingPolicyCount, assertNoDoubleSelection, assertSelectionEnforcementLevel } from "@pulumi-premium-policies/unit-test-helpers";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

describe("policiesManagement.general", function() {

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
        policiesManagement.resetPolicyfilter();
        assertHasAllRemainingPolicies();
    });

    /*
     * After selecting the `core` policies, other polices Should
     * still be present in the pool. This will likely fail when
     * policies are stored in their own npm packages though.
     */
    it("#5", async function() {
        const policiesStats = policiesManagement.getStats();
        const selection = policiesManagement.filterPolicies({
            services: ["core"],
        });
        assertHasRemainingPolicies();
        assertExpectedRemainingPolicyCount(policiesStats.policyCount - selection.length);
    });

    it("#6", async function() {
        const policiesStats = policiesManagement.getStats();
        policiesManagement.resetPolicyfilter();
        assertHasAllRemainingPolicies();
        assertExpectedRemainingPolicyCount(policiesStats.policyCount);
    });

    it("#7", async function() {
        assertNoDoubleSelection({
            vendors: ["kubernetes"],
        });
    });

    it("#8", async function() {
        assertNoDoubleSelection({
            vendors: ["kubernetes"],
            services: ["core"],
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
