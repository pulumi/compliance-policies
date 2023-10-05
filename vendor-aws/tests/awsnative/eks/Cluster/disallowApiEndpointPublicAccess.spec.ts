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

import "mocha";
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails,  assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi/unit-test-helpers";
import * as policies from "../../../../index";
import * as enums from "../../enums";
import { getResourceValidationArgs } from "./resource";

describe("awsnative.eks.Cluster.disallowApiEndpointPublicAccess", function() {
    const policy = policies.awsnative.eks.Cluster.disallowApiEndpointPublicAccess;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-eks-cluster-disallow-api-endpoint-public-access");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["eks"],
            severity: "critical",
            topics: ["network"],
            frameworks: ["pcidss", "iso27001"],
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
        args.props.resourcesVpcConfig.endpointPublicAccess = undefined;
        await assertHasResourceViolation(policy, args, { message: "EKS Cluster Encryption API endpoint should not be publicly accessible." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.resourcesVpcConfig.endpointPublicAccess = undefined;
        args.props.resourcesVpcConfig.publicAccessCidrs = [ "0.0.0.0/0" ];
        await assertHasResourceViolation(policy, args, { message: "EKS Cluster Encryption API endpoint should not be publicly accessible." });
    });
});
