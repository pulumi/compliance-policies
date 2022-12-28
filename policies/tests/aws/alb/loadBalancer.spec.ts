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
import { s3 } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.alb.LoadBalancer, {
        accessLogs: {
            bucket: s3.bucketId,
            prefix: "bucket-prefix",
            enabled: true,
        },
        internal: false,
    });
}

describe("aws.alb.LoadBalancer.enableAccessLogging", () => {
    const policy = policies.aws.alb.LoadBalancer.enableAccessLogging;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-alb-loadbalancer-enable-access-logging");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["alb"],
            severity: "medium",
            topics: ["network", "logging"],
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
        args.props.accessLogs = undefined;
        await assertHasResourceViolation(policy, args, { message: "ALB LoadBalancers should have access logging enabled." });
    });
});

describe("aws.alb.LoadBalancer.configureAccessLogging", () => {
    const policy = policies.aws.alb.LoadBalancer.configureAccessLogging;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-alb-loadbalancer-configure-access-logging");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["alb"],
            severity: "medium",
            topics: ["network", "logging"],
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
        args.props.accessLogs.enabled = false;
        await assertHasResourceViolation(policy, args, { message: "ALB LoadBalancers should have access logging configured and enabled." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.accessLogs.bucket = undefined;
        await assertHasResourceViolation(policy, args, { message: "ALB LoadBalancers should have access logging configured and enabled." });
    });
});
