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
import { kms, secretsmanager } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.appflow.ConnectorProfile, {
        connectionMode: "Public",
        connectorProfileConfig: {
            connectorProfileCredentials: {
                salesforce: {
                    accessToken: "sfdc-access-token",
                    clientCredentialsArn: secretsmanager.secretArn,
                }
            },
            connectorProfileProperties: {
                salesforce: {
                    instanceUrl: "https://api.salesforce.com.example.com/api/",
                    isSandboxEnvironment: false,
                }
            }
        },
        connectorType: "Salesforce",
        kmsArn: kms.keyArn,
    });
}

describe("aws.appflow.ConnectorProfile.configureCustomerManagedKey", () => {
    const policy = policies.aws.appflow.ConnectorProfile.configureCustomerManagedKey;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-appflow-connectorprofile-configure-customer-managed-key");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["appflow"],
            severity: "low",
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
        args.props.kmsArn = undefined;
        await assertHasResourceViolation(policy, args, { message: "AppFlow Connector Profiles should be encrypted using a customer-managed KMS key." });
    });
});
