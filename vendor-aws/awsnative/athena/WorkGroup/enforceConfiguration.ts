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
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that Athena Workgroups enforce their configuration to their clients.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/athena/latest/ug/workgroups-procedure.html
 */
export const enforceConfiguration: ResourceValidationPolicy = policyManager.registerPolicy({
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
    frameworks: ["pcidss", "iso27001"],
});
