"use strict";
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
exports.__esModule = true;
exports.configureCustomerManagedKey = exports.disallowUnencryptedVolume = void 0;
var awsnative = require("@pulumi/aws-native");
var policy_1 = require("@pulumi/policy");
var utils_1 = require("../../utils");
/**
 * Checks that EBS volumes are encrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
exports.disallowUnencryptedVolume = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-ec2-volume-disallow-unencrypted-volume",
        description: "Checks that EBS volumes are encrypted.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.ec2.Volume, function (v, args, reportViolation) {
            if (!v.encrypted) {
                reportViolation("An EBS volume is currently not encrypted.");
            }
        })
    },
    vendors: ["aws"],
    services: ["ebs"],
    severity: "high",
    topics: ["encryption", "storage"]
});
/**
 * Check that encrypted EBS volume uses a customer-managed KMS key.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
exports.configureCustomerManagedKey = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-ec2-volume-configure-customer-managed-key",
        description: "Check that encrypted EBS volumes use a customer-manager KMS key.",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.ec2.Volume, function (v, args, reportViolation) {
            if (v.encrypted && !v.kmsKeyId) {
                reportViolation("An EBS volume should be encrypted using a customer-managed KMS key.");
            }
        })
    },
    vendors: ["aws"],
    services: ["ebs"],
    severity: "low",
    topics: ["encryption", "storage"]
});
