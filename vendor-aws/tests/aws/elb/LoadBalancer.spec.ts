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
    return createResourceValidationArgs(aws.elb.LoadBalancer, {
        availabilityZones: [
            enums.root.availabilityZone1,
            enums.root.availabilityZone2,
        ],
        accessLogs: {
            bucket: enums.s3.bucketId,
            bucketPrefix: "bucket-prefix",
            interval: 60,
        },
        listeners: [{
            instancePort: 8000,
            instanceProtocol: "http",
            lbPort: 443,
            lbProtocol: "https",
            sslCertificateId: enums.iam.sslCertificateArn,
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

describe("aws.elb.LoadBalancer.disallowUnencryptedTraffic", function() {
    const policy = policies.aws.elb.LoadBalancer.disallowUnencryptedTraffic;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-elb-loadbalancer-disallow-unencrypted-traffic");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["elb"],
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
        args.props.listeners[0].lbProtocol = "http";
        await assertHasResourceViolation(policy, args, { message: "ELB Load Balancers should now allow unencrypted (HTTP) traffic." });
    });
});

describe("aws.elb.LoadBalancer.configureMultiAvailabilityZone", function() {
    const policy = policies.aws.elb.LoadBalancer.configureMultiAvailabilityZone;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-elb-loadbalancer-configure-multi-availability-zone");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["elb"],
            severity: "high",
            topics: ["network", "availability"],
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
        args.props.availabilityZones = [enums.root.availabilityZone1];
        await assertHasResourceViolation(policy, args, { message: "ELB Load Balancers should use more than one availability zone." });
    });
});

describe("aws.elb.LoadBalancer.configureAccessLogging", function() {
    const policy = policies.aws.elb.LoadBalancer.configureAccessLogging;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-elb-loadbalancer-configure-access-logging");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["elb"],
            severity: "medium",
            topics: ["network", "logging"],
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
        args.props.accessLogs = undefined;
        await assertHasResourceViolation(policy, args, { message: "ELB Load Balancers should have access logging enabled." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.accessLogs.enabled = false;
        await assertHasResourceViolation(policy, args, { message: "ELB Load Balancers should have access logging enabled." });
    });

    it("#4", async function() {
        const args = getResourceValidationArgs();
        args.props.accessLogs.enabled = undefined; // When undefined, the default is `true`.
        await assertNoResourceViolations(policy, args);
    });
});

describe("aws.elb.LoadBalancer.enableHealthCheck", function() {
    const policy = policies.aws.elb.LoadBalancer.enableHealthCheck;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-elb-loadbalancer-enable-health-check");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["elb"],
            severity: "high",
            topics: ["network", "availability"],
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
        args.props.healthCheck = undefined;
        await assertHasResourceViolation(policy, args, { message: "ELB Load Balancers should have health checks enabled." });
    });
});
