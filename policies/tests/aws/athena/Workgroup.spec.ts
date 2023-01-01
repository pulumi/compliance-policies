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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "../../utils";
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
    return createResourceValidationArgs(aws.athena.Workgroup, {
        description: "This is a description for aws.athena.NamedQuery.",
        configuration: {
            bytesScannedCutoffPerQuery: 1048576000,
            enforceWorkgroupConfiguration: true,
            publishCloudwatchMetricsEnabled: true,
            resultConfiguration: {
                encryptionConfiguration: {
                    encryptionOption: "SSE_KMS",
                    kmsKeyArn: enums.kms.keyArn,
                },
            },
        },
        state: "ENABLED",
    });
}

describe("aws.athena.Workgroup.missingDescription", function() {
    const policy = policies.aws.athena.Workgroup.missingDescription;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-athena-workgroup-missing-description");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["athena"],
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
        assertCodeQuality(this.test?.parent?.title);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.description = undefined;
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroups should have a description." });
    });
});

describe("aws.athena.Workgroup.disallowUnencryptedWorkgroup", function() {
    const policy = policies.aws.athena.Workgroup.disallowUnencryptedWorkgroup;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-athena-workgroup-disallow-unencrypted-workgroup");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["athena"],
            severity: "high",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.configuration = undefined;
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroups should be encrypted." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.configuration.resultConfiguration.encryptionConfiguration = undefined;
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroups should be encrypted." });
    });
});

describe("aws.athena.Workgroup.configureCustomerManagedKey", function() {
    const policy = policies.aws.athena.Workgroup.configureCustomerManagedKey;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-athena-workgroup-configure-customer-managed-key");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["athena"],
            severity: "low",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.configuration.resultConfiguration.encryptionConfiguration = undefined;
        await assertNoResourceViolations(policy, args);
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.configuration.resultConfiguration.encryptionConfiguration.encryptionOption = "SSE_S3";
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroups should be encrypted using a customer-managed key." });
    });
});

describe("aws.athena.Workgroup.enforceConfiguration", function() {
    const policy = policies.aws.athena.Workgroup.enforceConfiguration;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-athena-workgroup-enforce-configuration");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["athena"],
            severity: "high",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.configuration = undefined;
        await assertNoResourceViolations(policy, args);
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.configuration.enforceWorkgroupConfiguration = false;
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroups should enforce their configuration to their clients." });
    });
});
