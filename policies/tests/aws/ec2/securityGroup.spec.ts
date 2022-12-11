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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName } from "../../utils";
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

    it("missingDescription (name)", async () => {
        assertResourcePolicyName(policy, "aws-ec2-security-group-missing-description");
    });

    it("missingDescription (registration)", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("missingDescription (metadata)", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "low",
            topics: ["documentation"],
        });
    });

    it("missingDescription #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("missingDescription #2", async () => {
        const args = getResourceValidationArgs();
        args.props.description = undefined;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should have a description." });
    });
});

describe("aws.ec2.SecurityGroup.missingIngressRuleDescription", () => {
    const policy = policies.aws.ec2.SecurityGroup.missingIngressRuleDescription;

    it("missingIngressRuleDescription (name)", async () => {
        assertResourcePolicyName(policy, "aws-ec2-security-group-missing-ingress-rule-description");
    });

    it("missingIngressRuleDescription (registration)", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("missingIngressRuleDescription (metadata)", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "low",
            topics: ["documentation"],
        });
    });

    it("missingIngressRuleDescription #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("missingIngressRuleDescription #2", async () => {
        const args = getResourceValidationArgs();
        args.props.ingress[0].description = undefined;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups Ingress rules should have a description." });
    });
});

describe("aws.ec2.SecurityGroup.missingEgressRuleDescription", () => {
    const policy = policies.aws.ec2.SecurityGroup.missingEgressRuleDescription;

    it("missingEgressRuleDescription (name)", async () => {
        assertResourcePolicyName(policy, "aws-ec2-security-group-missing-egress-rule-description");
    });

    it("missingEgressRuleDescription (registration)", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("missingEgressRuleDescription (metadata)", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "low",
            topics: ["documentation"],
        });
    });

    it("missingEgressRuleDescription #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("missingEgressRuleDescription #2", async () => {
        const args = getResourceValidationArgs();
        args.props.egress[0].description = undefined;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups Egress rules should have a description." });
    });
});

describe("aws.ec2.SecurityGroup.disallowInboundHttpTraffic", () => {
    const policy = policies.aws.ec2.SecurityGroup.disallowInboundHttpTraffic;

    it("disallowInboundHttpTraffic (name)", async () => {
        assertResourcePolicyName(policy, "aws-ec2-security-group-disallow-inbound-http-traffic");
    });

    it("disallowInboundHttpTraffic (registration)", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("disallowInboundHttpTraffic (metadata)", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "critical",
            topics: ["network", "encryption"],
        });
    });

    it("disallowInboundHttpTraffic #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("disallowInboundHttpTraffic #2", async () => {
        const args = getResourceValidationArgs();
        args.props.ingress[0].fromPort = 80;
        args.props.ingress[0].toPort = 80;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not allow ingress HTTP traffic." });
    });

    it("disallowInboundHttpTraffic #3", async () => {
        const args = getResourceValidationArgs();
        args.props.ingress[0].fromPort = 79;
        args.props.ingress[0].toPort = 81;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not allow ingress HTTP traffic." });
    });
});

describe("aws.ec2.SecurityGroup.disallowPublicInternetIngress", () => {
    const policy = policies.aws.ec2.SecurityGroup.disallowPublicInternetIngress;

    it("disallowPublicInternetIngress (name)", async () => {
        assertResourcePolicyName(policy, "aws-ec2-security-group-disallow-public-internet-ingress");
    });

    it("disallowPublicInternetIngress (registration)", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("disallowPublicInternetIngress (metadata)", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "critical",
            topics: ["network"],
        });
    });

    it("disallowPublicInternetIngress #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("disallowPublicInternetIngress #2", async () => {
        const args = getResourceValidationArgs();
        args.props.ingress[0].cidrBlocks = [ec2.cidrBlock, "0.0.0.0/0"];
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not permit ingress traffic from the public internet (0.0.0.0/0)." });
    });

    it("disallowPublicInternetIngress #3", async () => {
        const args = getResourceValidationArgs();
        args.props.ingress[0].ipv6CidrBlocks = [ec2.ipv6CidrBlock, "::/0"];
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not permit ingress traffic from the public internet (::/0)." });
    });
});
