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

import * as awsnative from "@pulumi/aws-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "../../utils";

/**
 * Checks that Athena WorkGroups have a description.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/athena/latest/ug/workgroups-procedure.html
 */
export const missingDescription: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-athena-workgroup-missing-description",
        description: "Checks that Athena WorkGroups have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.athena.WorkGroup, (workgroup, args, reportViolation) => {
            if (!workgroup.description) {
                reportViolation("Athena WorkGroups should have a description.");
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
        name: "awsnative-athena-workgroup-disallow-unencrypted-workgroup",
        description: "Checks that Athena Workgroups are encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.athena.WorkGroup, (workgroup, args, reportViolation) => {
            if (!workgroup.workGroupConfiguration ||
                !workgroup.workGroupConfiguration.resultConfiguration ||
                !workgroup.workGroupConfiguration.resultConfiguration.encryptionConfiguration) {
                reportViolation("Athena Workgroup Configurations should be encrypted.");
            }
            if (!workgroup.workGroupConfigurationUpdates ||
                !workgroup.workGroupConfigurationUpdates.resultConfigurationUpdates ||
                !workgroup.workGroupConfigurationUpdates.resultConfigurationUpdates.encryptionConfiguration) {
                reportViolation("Athena Workgroup Configuration Updates should be encrypted.");
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
        name: "awsnative-athena-workgroup-configure-customer-managed-key",
        description: "Checks that Athena Workgroups use a customer-managed-key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.athena.WorkGroup, (workgroup, args, reportViolation) => {
            if (workgroup.workGroupConfiguration && workgroup.workGroupConfiguration.resultConfiguration &&
                workgroup.workGroupConfiguration.resultConfiguration.encryptionConfiguration &&
                workgroup.workGroupConfiguration.resultConfiguration.encryptionConfiguration.encryptionOption !== "SSE_KMS") {
                reportViolation("Athena Workgroups Configurations should be encrypted using a customer-managed key.");
            }
            if (workgroup.workGroupConfigurationUpdates && workgroup.workGroupConfigurationUpdates.resultConfigurationUpdates &&
                workgroup.workGroupConfigurationUpdates.resultConfigurationUpdates.encryptionConfiguration &&
                workgroup.workGroupConfigurationUpdates.resultConfigurationUpdates.encryptionConfiguration.encryptionOption !== "SSE_KMS") {
                reportViolation("Athena Workgroups Configuration Updates should be encrypted using a customer-managed key.");
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
        name: "awsnative-athena-workgroup-enforce-configuration",
        description: "Checks that Athena Workgroups enforce their configuration to their clients.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.athena.WorkGroup, (workgroup, args, reportViolation) => {
            if (workgroup.workGroupConfiguration && !workgroup.workGroupConfiguration.enforceWorkGroupConfiguration) {
                reportViolation("Athena Workgroups Configurations should enforce their configuration to their clients.");
            }
            if (workgroup.workGroupConfigurationUpdates && !workgroup.workGroupConfigurationUpdates.enforceWorkGroupConfiguration) {
                reportViolation("Athena Workgroups Configuration Updates should enforce their configuration to their clients.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "high",
    topics: ["encryption", "storage"],
});
