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

describe("aws.ecs.TaskDefinition.disallowPrivilegedContainers", function() {
    const policy = policies.aws.ecs.TaskDefinition.disallowPrivilegedContainers;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ecs-taskdefinition-disallow-privileged-containers");
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

    it("#1 - non-privileged containers pass", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2 - privileged container fails", async function() {
        const args = getResourceValidationArgs();
        const containerDefs = JSON.parse(args.props.containerDefinitions as string);
        containerDefs[0].privileged = true;
        args.props.containerDefinitions = JSON.stringify(containerDefs);
        await assertHasResourceViolation(policy, args, { 
            message: "Container 'app' in ECS task definition has 'privileged' set to true. Privileged containers can access host resources, which is a security risk." 
        });
    });

    it("#3 - multiple containers with one privileged fails", async function() {
        const args = getResourceValidationArgs();
        const containerDefs = JSON.parse(args.props.containerDefinitions as string);
        containerDefs.push({
            name: "sidecar",
            image: "amazon/sidecar",
            cpu: 128,
            memory: 256,
            essential: false,
            privileged: true
        });
        args.props.containerDefinitions = JSON.stringify(containerDefs);
        await assertHasResourceViolation(policy, args, { 
            message: "Container 'sidecar' in ECS task definition has 'privileged' set to true. Privileged containers can access host resources, which is a security risk." 
        });
    });

    it("#4 - malformed container definitions fail", async function() {
        const args = getResourceValidationArgs();
        args.props.containerDefinitions = "{malformed json";
        await assertHasResourceViolation(policy, args, { 
            message: "Unable to parse container definitions to check for privileged containers. Ensure the definitions are valid JSON." 
        });
    });
});