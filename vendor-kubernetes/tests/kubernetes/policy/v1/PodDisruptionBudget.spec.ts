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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi-premium-policies/unit-test-helpers";
import * as kubernetes from "@pulumi/kubernetes";

import * as policies from "../../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(kubernetes.policy.v1.PodDisruptionBudget, {
        spec: {
            maxUnavailable: 1,
            selector: {
                matchLabels: {
                    "app.kubernetes.io/name": "MyApp",
                },
            },
        },
    });
}

describe("kubernetes.policy.v1.PodDisruptionBudget.disallowZeroVoluntaryDisruption", function() {
    const policy = policies.kubernetes.policy.v1.PodDisruptionBudget.disallowZeroVoluntaryDisruption;

    it("name", async function() {
        assertResourcePolicyName(policy, "kubernetes-policy-v1-poddisruptionbudget-disallow-zero-voluntary-disruption");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["kubernetes"],
            services: ["policy"],
            severity: "high",
            topics: ["availability"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.spec.maxUnavailable = "20%";
        await assertNoResourceViolations(policy, args);
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.spec.maxUnavailable = 0;
        await assertHasResourceViolation(policy, args, { message: "Kubernetes PodDisruptionBudgets should allow voluntary pod disruption when setting 'maxUnavailable'."});
    });

    it("#4", async function() {
        const args = getResourceValidationArgs();
        args.props.spec.maxUnavailable = "0%";
        await assertHasResourceViolation(policy, args, { message: "Kubernetes PodDisruptionBudgets should allow voluntary pod disruption when setting 'maxUnavailable'."});
    });

    it("#5", async function() {
        const args = getResourceValidationArgs();
        args.props.spec.maxUnavailable = undefined;
        args.props.spec.minAvailable = 1;
        await assertNoResourceViolations(policy, args);
    });

    it("#6", async function() {
        const args = getResourceValidationArgs();
        args.props.spec.maxUnavailable = undefined;
        args.props.spec.minAvailable = "100%";
        await assertHasResourceViolation(policy, args, { message: "Kubernetes PodDisruptionBudgets should allow voluntary pod disruption when setting 'minAvailable'." });
    });


});
