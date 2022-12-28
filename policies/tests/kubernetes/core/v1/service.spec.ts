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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription } from "../../../utils";
import * as kubernetes from "@pulumi/kubernetes";

import * as policies from "../../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(kubernetes.core.v1.Service, {
        metadata: {
            labels: {
                "app.kubernetes.io/name": "MyApp",
                "app.kubernetes.io/instance": "MyApp-abcxyz",
                "app.kubernetes.io/version": "1.0.2",
                "app.kubernetes.io/component": "application",
                "app.kubernetes.io/part-of": "finance-erp",
                "app.kubernetes.io/managed-by": "pulumi",
            }
        },
        spec: {
            ports: [{
                port: 80,
                protocol: "TCP",
                targetPort: 9376,
            }],
        }
    });
}

describe("kubernetes.core.v1.Service.configureRecommendedLabel", () => {
    const policy = policies.kubernetes.core.v1.Service.configureRecommendedLabel;

    it("name", async () => {
        assertResourcePolicyName(policy, "kubernetes-core-v1-service-configure-recommended-label");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["kubernetes"],
            services: ["core", "service"],
            severity: "low",
            topics: ["usability"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.metadata = undefined;
        await assertHasResourceViolation(policy, args, { message: "Kubernetes Services should use the recommended labels." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.metadata.labels = {"department": "finances"};
        await assertHasResourceViolation(policy, args, { message: "Kubernetes Services should have the recommended labels." });
    });
});
