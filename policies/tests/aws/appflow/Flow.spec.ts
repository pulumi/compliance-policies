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
    return createResourceValidationArgs(aws.appflow.Flow, {
        destinationFlowConfigs: [{
            connectorType: "S3",
            destinationConnectorProperties: {
                s3: {
                    bucketName: enums.s3.bucketId,
                    bucketPrefix: "sfdc-bucket-prefix",
                },
            },
        }],
        sourceFlowConfig: {
            connectorType: "Salesforce",
            sourceConnectorProperties: {
                salesforce: {
                    object: "veeva-object",
                    includeDeletedRecords: true,
                },
            },
        },
        tasks: [{
            sourceFields: ["field_a", "field_b"],
            taskType: "Passthrough",
        }],
        triggerConfig: {
            triggerType: "Event",
        },
        description: "Salesforce to S3 AppFlow flow.",
        kmsArn: enums.kms.keyArn,
    });
}

describe("aws.appflow.Flow.configureCustomerManagedKey", function() {
    const policy = policies.aws.appflow.Flow.configureCustomerManagedKey;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-appflow-flow-configure-customer-managed-key");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["appflow"],
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
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.kmsArn = undefined;
        await assertHasResourceViolation(policy, args, { message: "AppFlow Flow should be encrypted using a customer-managed KMS key." });
    });
});

describe("aws.appflow.Flow.missingDescription", function() {
    const policy = policies.aws.appflow.Flow.missingDescription;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-appflow-flow-missing-description");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["appflow"],
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
        args.props.description = "";
        await assertHasResourceViolation(policy, args, { message: "AppFlow Flow should have a description." });
    });
});
