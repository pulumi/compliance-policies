// Copyright 2016-2023, Pulumi Corporation.
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
    return createResourceValidationArgs(kubernetes.apps.v1.Deployment, {
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
            replicas: 3,
            selector: {
                matchLabels: {
                    app: "nginx",
                },
            },
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
                    }],
                },
            },
        },
    });
}

describe("kubernetes.apps.v1.Deployment.configureMinimumReplicaCount", function() {
    const policy = policies.kubernetes.apps.v1.Deployment.configureMinimumReplicaCount;

    it("name", async function() {
        assertResourcePolicyName(policy, "kubernetes-apps-v1-deployment-configure-minimum-replica-count");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["kubernetes"],
            services: ["apps", "replicaset"],
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
        args.props.spec.replicas = undefined;
        await assertHasResourceViolation(policy, args, { message: "Kubernetes Deployments should have at least three replicas." });
    });
});

describe("kubernetes.apps.v1.Deployment.configureRecommendedLabels", function() {
    const policy = policies.kubernetes.apps.v1.Deployment.configureRecommendedLabels;

    it("name", async function() {
        assertResourcePolicyName(policy, "kubernetes-apps-v1-deployment-configure-recommended-labels");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["kubernetes"],
            services: ["apps", "deployment"],
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
        await assertHasResourceViolation(policy, args, { message: "Kubernetes Deployments should use the recommended labels." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.metadata.labels = {"department": "finances"};
        await assertHasResourceViolation(policy, args, { message: "Kubernetes Deployments should have the recommended labels." });
    });
});
