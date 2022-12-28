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
import { iam, root, s3 } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.elb.LoadBalancer, {
        availabilityZones: [
            root.availabilityZone1,
            root.availabilityZone2,
        ],
        accessLogs: {
            bucket: s3.bucketId,
            bucketPrefix: "bucket-prefix",
            interval: 60,
        },
        listeners: [{
            instancePort: 8000,
            instanceProtocol: "http",
            lbPort: 443,
            lbProtocol: "https",
            sslCertificateId: iam.sslCertificateArn,
        }],
        healthCheck: {
            healthyThreshold: 2,
            unhealthyThreshold: 2,
            timeout: 3,
            target: "HTTP:8000/",
            interval: 30,
        },
    });
}

describe("aws.elb.LoadBalancer.disallowInboundHttpTraffic", () => {
    const policy = policies.aws.elb.LoadBalancer.disallowUnencryptedTraffic;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-elb-loadbalancer-disallow-unencrypted-traffic");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["elb"],
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
        args.props.listeners[0].lbProtocol = "http";
        await assertHasResourceViolation(policy, args, { message: "ELB Load Balancers should now allow unencrypted (HTTP) traffic." });
    });
});

describe("aws.elb.LoadBalancer.configureMultiAvailabilityZone", () => {
    const policy = policies.aws.elb.LoadBalancer.configureMultiAvailabilityZone;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-elb-loadbalancer-configure-multi-availability-zone");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["elb"],
            severity: "high",
            topics: ["network", "availability"],
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
        args.props.availabilityZones = [root.availabilityZone1];
        await assertHasResourceViolation(policy, args, { message: "ELB Load Balancers should use more than one availability zone." });
    });
});

describe("aws.elb.LoadBalancer.configureAccessLogging", () => {
    const policy = policies.aws.elb.LoadBalancer.configureAccessLogging;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-elb-loadbalancer-configure-access-logging");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["elb"],
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
        await assertHasResourceViolation(policy, args, { message: "ELB Load Balancers should have access logging enabled." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.accessLogs.enabled = false;
        await assertHasResourceViolation(policy, args, { message: "ELB Load Balancers should have access logging enabled." });
    });

    it("#4", async () => {
        const args = getResourceValidationArgs();
        args.props.accessLogs.enabled = undefined; // When undefined, the default is `true`.
        await assertNoResourceViolations(policy, args);
    });
});

describe("aws.elb.LoadBalancer.enableHealthCheck", () => {
    const policy = policies.aws.elb.LoadBalancer.enableHealthCheck;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-elb-loadbalancer-enable-health-check");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["elb"],
            severity: "high",
            topics: ["network", "availability"],
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
        args.props.healthCheck = undefined;
        await assertHasResourceViolation(policy, args, { message: "ELB Load Balancers should have health checks enabled." });
    });
});
