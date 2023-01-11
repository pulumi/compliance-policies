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
    return createResourceValidationArgs(aws.eks.Cluster, {
        roleArn: enums.iam.roleArn,
        vpcConfig: {
            subnetIds: [
                enums.ec2.subnetId1,
                enums.ec2.subnetId2,
            ],
            endpointPublicAccess: false,
            endpointPrivateAccess: true,
        },
        encryptionConfig: {
            provider: {
                keyArn: enums.kms.keyArn,
            },
            resources: ["secrets"],
        },
    });
}

describe("aws.eks.Cluster.enableClusterEncryptionConfig", function() {
    const policy = policies.aws.eks.Cluster.enableClusterEncryptionConfig;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-eks-cluster-enable-cluster-encryption-config");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["eks"],
            severity: "high",
            topics: ["encryption", "kubernetes"],
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
        args.props.encryptionConfig = undefined;
        await assertHasResourceViolation(policy, args, { message: "EKS Cluster Encryption Configuration should be enabled." });
    });
});

describe("aws.eks.Cluster.disallowApiEndpointPublicAccess", function() {
    const policy = policies.aws.eks.Cluster.disallowApiEndpointPublicAccess;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-eks-cluster-disallow-api-endpoint-public-access");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["eks"],
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
        args.props.vpcConfig.endpointPublicAccess = undefined;
        await assertHasResourceViolation(policy, args, { message: "EKS Cluster Endpoint API should not be publicly accessible." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.vpcConfig.endpointPublicAccess = undefined;
        args.props.vpcConfig.publicAccessCidrs = [ "0.0.0.0/0" ];
        await assertHasResourceViolation(policy, args, { message: "EKS Cluster Endpoint API should not be publicly accessible." });
    });
});
