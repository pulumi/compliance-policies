// Copyright 2016-2022, Pulumi Corporation.
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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import { ec2 } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.ec2.SecurityGroup, {
        description: "This is a description for aws.ec2.SecurityGroup.",
        vpcId: ec2.vpcId,
        ingress: [{
            description: "Ingress rule #1",
            fromPort: 443,
            toPort: 443,
            protocol: "TCP"
        }],
        egress: [{
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: [ec2.cidrBlock],
            ipv6CidrBlocks: [ec2.ipv6CidrBlock],
            description: "Egress rule #1",
        }],
    });
}

describe("aws.ec2.SecurityGroup.missingDescription", () => {
    const policy = policies.aws.ec2.SecurityGroup.missingDescription;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-ec2-security-group-missing-description");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "low",
            topics: ["documentation"],
        });
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.description = undefined;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should have a description." });
    });
});

describe("aws.ec2.SecurityGroup.missingIngressRuleDescription", () => {
    const policy = policies.aws.ec2.SecurityGroup.missingIngressRuleDescription;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-ec2-security-group-missing-ingress-rule-description");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "low",
            topics: ["documentation"],
        });
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.ingress[0].description = undefined;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups Ingress rules should have a description." });
    });
});

describe("aws.ec2.SecurityGroup.missingEgressRuleDescription", () => {
    const policy = policies.aws.ec2.SecurityGroup.missingEgressRuleDescription;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-ec2-security-group-missing-egress-rule-description");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "low",
            topics: ["documentation"],
        });
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.egress[0].description = undefined;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups Egress rules should have a description." });
    });
});

describe("aws.ec2.SecurityGroup.disallowInboundHttpTraffic", () => {
    const policy = policies.aws.ec2.SecurityGroup.disallowInboundHttpTraffic;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-ec2-security-group-disallow-inbound-http-traffic");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "critical",
            topics: ["network", "encryption"],
        });
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.ingress[0].fromPort = 80;
        args.props.ingress[0].toPort = 80;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not allow ingress HTTP traffic." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.ingress[0].fromPort = 79;
        args.props.ingress[0].toPort = 81;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not allow ingress HTTP traffic." });
    });
});

describe("aws.ec2.SecurityGroup.disallowPublicInternetIngress", () => {
    const policy = policies.aws.ec2.SecurityGroup.disallowPublicInternetIngress;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-ec2-security-group-disallow-public-internet-ingress");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "critical",
            topics: ["network"],
        });
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.ingress[0].cidrBlocks = [ec2.cidrBlock, "0.0.0.0/0"];
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not permit ingress traffic from the public internet (0.0.0.0/0)." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.ingress[0].ipv6CidrBlocks = [ec2.ipv6CidrBlock, "::/0"];
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not permit ingress traffic from the public internet (::/0)." });
    });
});
