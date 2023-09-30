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
import { createResourceValidationArgs } from "@pulumi-premium-policies/unit-test-helpers";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.s3.Bucket, {
        accessControl: awsnative.s3.BucketAccessControl.Private,
        replicationConfiguration: {
            role: enums.iam.roleArn,
            rules: [{
                destination: {
                    bucket: enums.s3.bucketId,
                },
                status: awsnative.s3.BucketReplicationRuleStatus.Enabled,
            }],
        },
        bucketEncryption: {
            serverSideEncryptionConfiguration: [{
                bucketKeyEnabled: true,
                serverSideEncryptionByDefault: {
                    sseAlgorithm: awsnative.s3.BucketServerSideEncryptionByDefaultSseAlgorithm.Awskms,
                    kmsMasterKeyId: enums.kms.keyArn,
                },
            }],
        },
    });
}
