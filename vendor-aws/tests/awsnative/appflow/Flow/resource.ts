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
import * as enums from "../../enums";
import { createResourceValidationArgs } from "@pulumi/unit-test-helpers";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.appflow.Flow, {
        destinationFlowConfigList: [{
            connectorType: "S3",
            destinationConnectorProperties: {
                s3: {
                    bucketName: enums.s3.bucketId,
                    bucketPrefix: "sfdc-bucket-prefix",
                },
            },
        }],
        sourceFlowConfig: {
            connectorType: "Salesforce",
            sourceConnectorProperties: {
                salesforce: {
                    object: "veeva-object",
                    includeDeletedRecords: true,
                },
            },
        },
        tasks: [{
            sourceFields: ["field_a", "field_b"],
            taskType: "Passthrough",
        }],
        triggerConfig: {
            triggerType: "Event",
        },
        description: "Salesforce to S3 AppFlow flow.",
        kmsArn: enums.kms.keyArn,
    });
}
