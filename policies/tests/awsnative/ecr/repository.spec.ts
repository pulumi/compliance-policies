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
import * as awsnative from "@pulumi/aws-native";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import { kms } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.ecr.Repository, {
        imageScanningConfiguration: {
            scanOnPush: true,
        },
        imageTagMutability: awsnative.ecr.RepositoryImageTagMutability.Immutable,
        encryptionConfiguration: {
            encryptionType: awsnative.ecr.RepositoryEncryptionType.Kms,
            kmsKey: kms.keyArn,
        }
    });
}

describe("awsnative.ecr.Repository.configureImageScan", () => {
    const policy = policies.awsnative.ecr.Repository.configureImageScan;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-ecr-repository-configure-image-scan");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecr"],
            severity: "high",
            topics: ["container", "vulnerability"],
            frameworks: ["soc2", "pcidss"],
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
        args.props.imageScanningConfiguration = undefined;
        await assertHasResourceViolation(policy, args, { message: "ECR Repositories should have image scanning configured." });
    });
});

describe("awsnative.ecr.Repository.enableImageScan", () => {
    const policy = policies.awsnative.ecr.Repository.enableImageScan;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-ecr-repository-enable-image-scan");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecr"],
            severity: "high",
            topics: ["container", "vulnerability"],
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
        args.props.imageScanningConfiguration.scanOnPush = false;
        await assertHasResourceViolation(policy, args, { message: "ECR Repositories should enable 'scan-on-push'." });
    });
});

describe("awsnative.ecr.Repository.disallowMutableImage", () => {
    const policy = policies.awsnative.ecr.Repository.disallowMutableImage;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-ecr-repository-disallow-mutable-image");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecr"],
            severity: "high",
            topics: ["container"],
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
        args.props.imageTagMutability = undefined;
        await assertHasResourceViolation(policy, args, { message: "ECR repositories should enable immutable images." });
    });
});

describe("awsnative.ecr.Repository.disallowUnencryptedRepository", () => {
    const policy = policies.awsnative.ecr.Repository.disallowUnencryptedRepository;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-ecr-repository-disallow-unencrypted-repository");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecr"],
            severity: "high",
            topics: ["container", "encryption", "storage"],
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
        args.props.encryptionConfiguration = undefined;
        await assertHasResourceViolation(policy, args, { message: "ECR repositories should be encrypted." });
    });
});

describe("awsnative.ecr.Repository.configureCustomerManagedKey", () => {
    const policy = policies.awsnative.ecr.Repository.configureCustomerManagedKey;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-ecr-repository-configure-customer-managed-key");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecr"],
            severity: "low",
            topics: ["container", "encryption", "storage"],
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
        args.props.encryptionConfiguration.encryptionType = undefined;
        await assertHasResourceViolation(policy, args, { message: "ECR repositories should be encrypted using a customer-managed KMS key." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.encryptionConfiguration.kmsKey = "";
        await assertHasResourceViolation(policy, args, { message: "ECR repositories should be encrypted using a customer-managed KMS key." });
    });
});
