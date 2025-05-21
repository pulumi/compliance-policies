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
import * as policies from "../../../../index";
import * as enums from "../../enums";
import { getResourceValidationArgs } from "./resource";

describe("aws.ecs.Service.requireTags", function () {
    const policy = policies.aws.ecs.Service.requireTags;

    it("name", async function () {
        assertResourcePolicyName(policy, "aws-ecs-service-require-tags");
    });

    it("registration", async function () {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function () {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecs"],
            severity: "medium",
            topics: ["tagging", "operations"],
            frameworks: ["cis"],
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

    it("policy-config-include", async function () {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: ["corp-.*"],
            ignoreCase: false,
            includeFor: ["my-.*", "corp-resource"],
        });
        await assertNoResourceViolations(policy, args);
    });

    it("policy-config-exclude", async function () {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: ["corp-.*"],
            ignoreCase: false,
            includeFor: ["my-.*", "some-resource"],
        });
        await assertNoResourceViolations(policy, args);
    });

    it("#1 - proper tags pass", async function () {
        const args = getResourceValidationArgs();
        args.props.tags = {
            Environment: "production",
            Project: "my-project",
            Owner: "team-xyz",
        };
        await assertNoResourceViolations(policy, args);
    });

    it("#2 - with required tags defined in config passes", async function () {
        const args = getResourceValidationArgs();
        args.getConfig = () => ({
            requiredTags: ["Environment", "Owner"],
        } as any);
        args.props.tags = {
            Environment: "production",
            Owner: "team-xyz",
        };
        await assertNoResourceViolations(policy, args);
    });

    it("#3 - missing all tags fails", async function () {
        const args = getResourceValidationArgs();
        args.props.tags = undefined;
        await assertHasResourceViolation(policy, args, {
            message:
        "ECS Service does not have any tags. All ECS Services should have tags to assist with management and compliance.",
        });
    });

    it("#4 - empty tags fails", async function () {
        const args = getResourceValidationArgs();
        args.props.tags = {};
        await assertHasResourceViolation(policy, args, {
            message:
        "ECS Service does not have any tags. All ECS Services should have tags to assist with management and compliance.",
        });
    });

    it("#5 - missing required tag fails", async function () {
        const args = getResourceValidationArgs();
        args.getConfig = () => ({
            requiredTags: ["Environment", "CostCenter", "Owner"],
        } as any);
        args.props.tags = {
            Environment: "production",
            Owner: "team-xyz",
            // CostCenter missing
        };
        await assertHasResourceViolation(policy, args, {
            message: "ECS Service is missing required tag: CostCenter",
        });
    });

    it("#6 - minimal tag count not met fails", async function () {
        const args = getResourceValidationArgs();
        args.getConfig = () => ({
            minTagCount: 4,
        } as any);
        args.props.tags = {
            Environment: "production",
            Project: "my-project",
            Owner: "team-xyz",
            // Only 3 tags, need 4
        };
        await assertHasResourceViolation(policy, args, {
            message: "ECS Service has 3 tags but the required minimum is 4.",
        });
    });
});
