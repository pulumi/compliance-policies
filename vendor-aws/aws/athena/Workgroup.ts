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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that Athena Workgroups have a description.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/athena/latest/ug/workgroups-procedure.html
 */
export const missingDescription: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-athena-workgroup-missing-description",
        description: "Checks that Athena Workgroups have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.athena.Workgroup, (workgroup, args, reportViolation) => {
            if (!workgroup.description) {
                reportViolation("Athena Workgroups should have a description.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "low",
    topics: ["documentation"],
});

/**
 * Checks that Athena Workgroups are encrypted.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/athena/latest/ug/workgroups-procedure.html
 */
export const disallowUnencryptedWorkgroup: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-athena-workgroup-disallow-unencrypted-workgroup",
        description: "Checks that Athena Workgroups are encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.athena.Workgroup, (workgroup, args, reportViolation) => {
            if (!workgroup.configuration ||
                !workgroup.configuration.resultConfiguration ||
                !workgroup.configuration.resultConfiguration.encryptionConfiguration) {
                reportViolation("Athena Workgroups should be encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that Athena Workgroups use a customer-managed-key.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/athena/latest/ug/workgroups-procedure.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-athena-workgroup-configure-customer-managed-key",
        description: "Checks that Athena Workgroups use a customer-managed-key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.athena.Workgroup, (workgroup, args, reportViolation) => {
            if (workgroup.configuration && workgroup.configuration.resultConfiguration &&
                workgroup.configuration.resultConfiguration.encryptionConfiguration &&
                workgroup.configuration.resultConfiguration.encryptionConfiguration.encryptionOption !== "SSE_KMS") {
                reportViolation("Athena Workgroups should be encrypted using a customer-managed key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "low",
    topics: ["encryption", "storage"],
});

/**
 * Checks that Athena Workgroups enforce their configuration to their clients.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/athena/latest/ug/workgroups-procedure.html
 */
export const enforceConfiguration: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-athena-workgroup-enforce-configuration",
        description: "Checks that Athena Workgroups enforce their configuration to their clients.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.athena.Workgroup, (workgroup, args, reportViolation) => {
            if (workgroup.configuration && !workgroup.configuration.enforceWorkgroupConfiguration) {
                reportViolation("Athena Workgroups should enforce their configuration to their clients.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "high",
    topics: ["encryption", "storage"],
});
