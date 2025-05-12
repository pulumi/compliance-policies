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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../index";
import * as enums from "../../enums";
import { getResourceValidationArgs } from "./resource";

describe("aws.ecs.TaskDefinition.disallowHostPidMode", function() {
    const policy = policies.aws.ecs.TaskDefinition.disallowHostPidMode;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ecs-taskdefinition-disallow-host-pid-mode");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecs"],
            severity: "high",
            topics: ["security", "containers"],
            frameworks: ["cis"],
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

    it("policy-config-include", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "corp-resource" ],
        });
        await assertNoResourceViolations(policy, args);
    });

    it("policy-config-exclude", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "some-resource" ],
        });
        await assertNoResourceViolations(policy, args);
    });

    it("#1 - task pid mode passes", async function() {
        const args = getResourceValidationArgs();
        args.props.pidMode = "task";
        await assertNoResourceViolations(policy, args);
    });

    it("#2 - host pid mode fails", async function() {
        const args = getResourceValidationArgs();
        args.props.pidMode = "host";
        await assertHasResourceViolation(policy, args, { 
            message: "ECS task definitions should not have 'pidMode' set to 'host'. This setting allows containers to see all processes on the host, which is a security risk." 
        });
    });

    it("#3 - undefined pid mode passes", async function() {
        const args = getResourceValidationArgs();
        args.props.pidMode = undefined;
        await assertNoResourceViolations(policy, args);
    });
});