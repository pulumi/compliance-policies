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

import * as azure from "@pulumi/azure-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import {policiesManagement} from "@pulumi-premium-policies/policy-management";

/**
 * Enable disk encryption on disk.
 *
 * @severity High
 * @link https://docs.microsoft.com/azure/virtual-machines/linux/disk-encryption-overview
 */
export const enableDiskEncryption: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-compute-disk-enable-disk-encryption",
        description: "Enable disk encryption on disk.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(azure.compute.Disk, (disk, args, reportViolation) => {
            if (disk.encryptionSettingsCollection) {
                if (disk.encryptionSettingsCollection.enabled === undefined || !disk.encryptionSettingsCollection.enabled) {
                    reportViolation("Enable disk encryption on disk.");
                }
            }
        }),
    },
    vendors: ["azure"],
    services: ["compute"],
    severity: "high",
    topics: ["security", "encryption"],
});
