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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import { ec2, iam, kms } from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.eks.Cluster, {
        roleArn: iam.roleArn,
        vpcConfig: {
            subnetIds: [
                ec2.subnetId1,
                ec2.subnetId2,
            ],
            endpointPublicAccess: false,
            endpointPrivateAccess: true,
        },
        encryptionConfig: {
            provider: {
                keyArn: kms.keyArn,
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

describe("aws.eks.Cluster.disallowAPIEndpointPublicAccess", function() {
    const policy = policies.aws.eks.Cluster.disallowAPIEndpointPublicAccess;

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
