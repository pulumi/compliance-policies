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
    return createResourceValidationArgs(kubernetes.batch.v1.Job, {
        metadata: {
            labels: {
                "app.kubernetes.io/name": "MyApp",
                "app.kubernetes.io/instance": "MyApp-abcxyz",
                "app.kubernetes.io/version": "1.0.2",
                "app.kubernetes.io/component": "application",
                "app.kubernetes.io/part-of": "finance-erp",
                "app.kubernetes.io/managed-by": "pulumi",
            },
        },
        spec: {
            backoffLimit: 4,
            template: {
                metadata: {
                    labels: {
                        "app.kubernetes.io/name": "MyApp",
                        "app.kubernetes.io/instance": "MyApp-abcxyz",
                        "app.kubernetes.io/version": "1.0.2",
                        "app.kubernetes.io/component": "application",
                        "app.kubernetes.io/part-of": "finance-erp",
                        "app.kubernetes.io/managed-by": "pulumi",
                    },
                },
                spec: {
                    containers: [{
                        image: "nginx:1.14.2",
                        name: "nginx",
                        ports: [{
                            containerPort: 80,
                        }],
                        securityContext: {
                            readOnlyRootFilesystem: true,
                        },
                    }],
                },
            },
        },
    });
}

describe("kubernetes.batch.v1.Job.configureRecommendedLabels", function() {
    const policy = policies.kubernetes.batch.v1.Job.configureRecommendedLabels;

    it("name", async function() {
        assertResourcePolicyName(policy, "kubernetes-batch-v1-job-configure-recommended-labels");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["kubernetes"],
            services: ["batch", "job"],
            severity: "low",
            topics: ["usability"],
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
        args.props.metadata = undefined;
        await assertHasResourceViolation(policy, args, { message: "Kubernetes Jobs should use the recommended labels." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.metadata.labels = {"department": "finances"};
        await assertHasResourceViolation(policy, args, { message: "Kubernetes Jobs should have the recommended labels." });
    });
});

describe("kubernetes.batch.v1.Job.enableReadOnlyRootFilesystem", function() {
    const policy = policies.kubernetes.batch.v1.Job.enableReadOnlyRootFilesystem;

    it("name", async function() {
        assertResourcePolicyName(policy, "kubernetes-batch-v1-job-enable-read-only-root-filesystem");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["kubernetes"],
            services: ["batch", "job"],
            severity: "high",
            topics: ["runtime", "security"],
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
        args.props.spec.template.spec.containers[0].securityContext.readOnlyRootFilesystem = undefined;
        await assertHasResourceViolation(policy, args, { message: "Kubernetes Jobs should run their pods using a read-only filesystem." });
    });
});
