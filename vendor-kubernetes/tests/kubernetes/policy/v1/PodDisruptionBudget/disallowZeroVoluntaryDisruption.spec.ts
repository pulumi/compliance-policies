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
import * as policies from "../../../../../index";
import { getResourceValidationArgs } from "./resource";

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
