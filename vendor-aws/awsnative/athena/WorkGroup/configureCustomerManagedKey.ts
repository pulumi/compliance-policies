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

import { WorkGroup } from "@pulumi/aws-native/athena";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that Athena Workgroups use a customer-managed-key.
 *
 * @severity low
 * @frameworks iso27001, pcidss
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/athena/latest/ug/workgroups-procedure.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-athena-workgroup-configure-customer-managed-key",
        description: "Checks that Athena Workgroups use a customer-managed-key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(WorkGroup, (workgroup, args, reportViolation) => {
            if (
                workgroup.workGroupConfiguration &&
                workgroup.workGroupConfiguration.resultConfiguration &&
                workgroup.workGroupConfiguration.resultConfiguration.encryptionConfiguration &&
                workgroup.workGroupConfiguration.resultConfiguration.encryptionConfiguration.encryptionOption !== "SSE_KMS"
            ) {
                reportViolation("Athena Workgroups Configurations should be encrypted using a customer-managed key.");
            }
            if (
                workgroup.workGroupConfigurationUpdates &&
                workgroup.workGroupConfigurationUpdates.resultConfigurationUpdates &&
                workgroup.workGroupConfigurationUpdates.resultConfigurationUpdates.encryptionConfiguration &&
                workgroup.workGroupConfigurationUpdates.resultConfigurationUpdates.encryptionConfiguration.encryptionOption !== "SSE_KMS"
            ) {
                reportViolation("Athena Workgroups Configuration Updates should be encrypted using a customer-managed key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "low",
    topics: ["encryption", "storage"],
    frameworks: ["pcidss", "iso27001"],
});
