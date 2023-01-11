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
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.ec2.SecurityGroup, {
        description: "This is a description for aws.ec2.SecurityGroup.",
        vpcId: enums.ec2.vpcId,
        ingress: [{
            description: "Ingress rule #1",
            fromPort: 443,
            toPort: 443,
            protocol: "TCP",
        }],
        egress: [{
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: [enums.ec2.cidrBlock],
            ipv6CidrBlocks: [enums.ec2.ipv6CidrBlock],
            description: "Egress rule #1",
        }],
    });
}

describe("aws.ec2.SecurityGroup.missingDescription", function() {
    const policy = policies.aws.ec2.SecurityGroup.missingDescription;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-securitygroup-missing-description");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "low",
            topics: ["documentation"],
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
        args.props.description = undefined;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should have a description." });
    });
});

describe("aws.ec2.SecurityGroup.missingIngressRuleDescription", function() {
    const policy = policies.aws.ec2.SecurityGroup.missingIngressRuleDescription;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-securitygroup-missing-ingress-rule-description");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "low",
            topics: ["documentation"],
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
        args.props.ingress[0].description = undefined;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups Ingress rules should have a description." });
    });
});

describe("aws.ec2.SecurityGroup.missingEgressRuleDescription", function() {
    const policy = policies.aws.ec2.SecurityGroup.missingEgressRuleDescription;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-securitygroup-missing-egress-rule-description");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "low",
            topics: ["documentation"],
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
        args.props.egress[0].description = undefined;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups Egress rules should have a description." });
    });
});

describe("aws.ec2.SecurityGroup.disallowInboundHttpTraffic", function() {
    const policy = policies.aws.ec2.SecurityGroup.disallowInboundHttpTraffic;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-securitygroup-disallow-inbound-http-traffic");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "critical",
            topics: ["network", "encryption"],
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
        args.props.ingress[0].fromPort = 80;
        args.props.ingress[0].toPort = 80;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not allow ingress HTTP traffic." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.ingress[0].fromPort = 79;
        args.props.ingress[0].toPort = 81;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not allow ingress HTTP traffic." });
    });
});

describe("aws.ec2.SecurityGroup.disallowPublicInternetIngress", function() {
    const policy = policies.aws.ec2.SecurityGroup.disallowPublicInternetIngress;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-securitygroup-disallow-public-internet-ingress");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "critical",
            topics: ["network"],
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
        args.props.ingress[0].cidrBlocks = [enums.ec2.cidrBlock, "0.0.0.0/0"];
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not permit ingress traffic from the public internet (0.0.0.0/0)." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.ingress[0].ipv6CidrBlocks = [enums.ec2.ipv6CidrBlock, "::/0"];
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not permit ingress traffic from the public internet (::/0)." });
    });
});
