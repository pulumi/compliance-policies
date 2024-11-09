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

import * as aws from "@pulumi/aws";
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
    }, policyconfig, resourceName);
}
