// Copyright 2016-2024, Pulumi Corporation.
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
import { ResourceValidationArgs } from "@pulumi/policy";
import { PolicyConfigSchemaArgs } from "@pulumi/compliance-policy-manager";
import * as enums from "../../enums";
import { createResourceValidationArgs } from "@pulumi/compliance-policies-unit-test-helpers";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(resourceName?: string, policyconfig?: PolicyConfigSchemaArgs): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.rds.DbInstance, {
        dbInstanceClass: enums.rds.dbInstanceClass,
        backupRetentionPeriod: 5,
        vpcSecurityGroups: [ enums.ec2.vpcSecurityGroupId ],
        enablePerformanceInsights: true,
        performanceInsightsKmsKeyId: enums.kms.keyArn,
        publiclyAccessible: false,
        storageEncrypted: true,
        kmsKeyId: enums.kms.keyArn,
    }, policyconfig, resourceName);
}
