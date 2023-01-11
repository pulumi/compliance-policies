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
