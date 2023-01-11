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
    return createResourceValidationArgs(awsnative.rds.DBInstance, {
        dBInstanceClass: enums.rds.dBInstanceClass,
        backupRetentionPeriod: 5,
        vPCSecurityGroups: [ enums.ec2.vpcSecurityGroupId ],
        enablePerformanceInsights: true,
        performanceInsightsKMSKeyId: enums.kms.keyArn,
        publiclyAccessible: false,
        storageEncrypted: true,
        kmsKeyId: enums.kms.keyArn,
    });
}

describe("awsnative.rds.DBInstance.enableBackupRetention", function() {
    const policy = policies.awsnative.rds.DBInstance.enableBackupRetention;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-enable-backup-retention");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "medium",
            topics: ["backup", "resilience"],
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
        args.props.backupRetentionPeriod = undefined;
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances backup retention should be enabled." });
    });
});

describe("awsnative.rds.DBInstance.configureBackupRetention", function() {
    const policy = policies.awsnative.rds.DBInstance.configureBackupRetention;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-configure-backup-retention");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "medium",
            topics: ["backup", "resilience"],
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
        args.props.backupRetentionPeriod = 2;
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances backup retention period should be greater than 3 days." });
    });
});

describe("awsnative.rds.DBInstance.enablePerformanceInsights", function() {
    const policy = policies.awsnative.rds.DBInstance.enablePerformanceInsights;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-enable-performance-insights");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "low",
            topics: ["logging", "performance"],
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
        args.props.enablePerformanceInsights = undefined;
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances should have performance insights enabled." });
    });
});

describe("awsnative.rds.DBInstance.disallowUnencryptedPerformanceInsights", function() {
    const policy = policies.awsnative.rds.DBInstance.disallowUnencryptedPerformanceInsights;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-disallow-unencrypted-performance-insights");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
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
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.performanceInsightsKMSKeyId = "";
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances should have performance insights encrypted." });
    });
});

describe("awsnative.rds.DBInstance.disallowPublicAccess", function() {
    const policy = policies.awsnative.rds.DBInstance.disallowPublicAccess;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-disallow-public-access");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
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
        args.props.publiclyAccessible = true;
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances public access should not be enabled." });
    });
});

describe("awsnative.rds.DBInstance.disallowUnencryptedStorage", function() {
    const policy = policies.awsnative.rds.DBInstance.disallowUnencryptedStorage;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-disallow-unencrypted-storage");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
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
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.storageEncrypted = false;
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances storage should be encrypted." });
    });
});

describe("awsnative.rds.DBInstance.configureCustomerManagedKey", function() {
    const policy = policies.awsnative.rds.DBInstance.configureCustomerManagedKey;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-configure-customer-managed-key");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
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
        args.props.kmsKeyId = "";
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances storage should be encrypted using a customer-managed key." });
    });
});
