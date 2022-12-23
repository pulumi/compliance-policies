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
import { kms, rds, root } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.rds.ClusterInstance, {
        clusterIdentifier: rds.dbClusterIdentifier,
        instanceClass: aws.rds.InstanceType.M1_Large,
        performanceInsightsEnabled: true,
        performanceInsightsKmsKeyId: kms.keyArn,
        publiclyAccessible: false,
    });
}

describe("aws.aws.rds.ClusterInstance.enablePerformanceInsights", () => {
    const policy = policies.aws.rds.ClusterInstance.enablePerformanceInsights;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-cluster-instance-enable-performance-insights");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "low",
            topics: ["logging", "performance"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.performanceInsightsEnabled = undefined;
        await assertHasResourceViolation(policy, args, { message: "RDS Cluster Instances should have performance insights enabled." });
    });
});

describe("aws.aws.rds.ClusterInstance.disallowUnencryptedPerformanceInsights", () => {
    const policy = policies.aws.rds.ClusterInstance.disallowUnencryptedPerformanceInsights;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-cluster-instance-disallow-unencrypted-performance-insights");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "high",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.performanceInsightsKmsKeyId = "";
        await assertHasResourceViolation(policy, args, { message: "RDS Cluster Instances should have performance insights encrypted." });
    });
});

describe("aws.aws.rds.ClusterInstance.disallowPublicAccess", () => {
    const policy = policies.aws.rds.ClusterInstance.disallowPublicAccess;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-cluster-instance-disallow-public-access");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "critical",
            topics: ["network"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.publiclyAccessible = true;
        await assertHasResourceViolation(policy, args, { message: "RDS Cluster Instances public access should not be enabled." });
    });
});
