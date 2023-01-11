// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import "mocha";
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi-premium-policies/unit-test-helpers";
import * as awsnative from "@pulumi/aws-native";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.appflow.Flow, {
        destinationFlowConfigList: [{
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
        kMSArn: enums.kms.keyArn,
    });
}

describe("awsnative.appflow.Flow.configureCustomerManagedKey", function() {
    const policy = policies.awsnative.appflow.Flow.configureCustomerManagedKey;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-appflow-flow-configure-customer-managed-key");
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
        args.props.kMSArn = undefined;
        await assertHasResourceViolation(policy, args, { message: "AppFlow Flow should be encrypted using a customer-managed KMS key." });
    });
});

describe("awsnative.appflow.Flow.missingDescription", function() {
    const policy = policies.awsnative.appflow.Flow.missingDescription;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-appflow-flow-missing-description");
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
