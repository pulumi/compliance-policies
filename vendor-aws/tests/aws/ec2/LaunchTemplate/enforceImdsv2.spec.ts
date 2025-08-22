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

describe("aws.ec2.LaunchTemplate.enforceImdsv2", function () {
    const policy = policies.aws.ec2.LaunchTemplate.enforceImdsv2;

    it("name", async function () {
        assertResourcePolicyName(policy, "aws-ec2-launchtemplate-enforce-imdsv2");
    });

    it("registration", async function () {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function () {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "high",
            topics: ["hardening", "network"],
            frameworks: ["cis", "pcidss", "hitrust", "iso27001"],
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
        // Compliant when included
        args.props.metadataOptions = {
            httpTokens: "required",
        };
        await assertNoResourceViolations(policy, args);
    });

    it("policy-config-exclude", async function () {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: ["corp-.*"],
            ignoreCase: false,
            includeFor: ["my-.*", "some-resource"],
        });
        // Non-compliant but excluded => no violations
        args.props.metadataOptions = {
            httpTokens: "optional",
        };
        await assertNoResourceViolations(policy, args);
    });

    it("#1 compliant: tokens required", async function () {
        const args = getResourceValidationArgs();
        args.props.metadataOptions = {
            httpTokens: "required",
        };
        await assertNoResourceViolations(policy, args);
    });

    it("#2 violation: tokens not required", async function () {
        const args = getResourceValidationArgs();
        args.props.metadataOptions = {
            httpTokens: "optional",
        };
        await assertHasResourceViolation(policy, args, {
            message: "EC2 Launch Templates must set metadataOptions.httpTokens='required' to enforce IMDSv2.",
        });
    });

    it("#3 compliant: endpoint disabled", async function () {
        const args = getResourceValidationArgs();
        args.props.metadataOptions = {
            httpEndpoint: "disabled",
        };
        await assertNoResourceViolations(policy, args);
    });

    it("#4 violation: metadataOptions missing", async function () {
        const args = getResourceValidationArgs();
        args.props.metadataOptions = undefined;
        await assertHasResourceViolation(policy, args, {
            message:
                "EC2 Launch Templates must configure metadataOptions.httpTokens='required' to enforce IMDSv2, or disable the metadata endpoint.",
        });
    });
});
