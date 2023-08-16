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

import * as awsnative from "@pulumi/aws-native";
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../../enums";
import { createResourceValidationArgs } from "@pulumi-premium-policies/unit-test-helpers";

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
