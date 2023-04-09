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

import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import { VirtualMachine } from "@pulumi/azure-native/compute/virtualMachine";

/**
 * Authentication to Linux machines should require SSH keys.
 *
 * @severity High
 * @link https://docs.microsoft.com/azure/virtual-machines/linux/create-ssh-keys-detailed
 */
export const disallowPasswordAuthentication: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-compute-virtualmachine-disallow-password-authentication",
        description: "Authentication to Linux machines should require SSH keys.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(VirtualMachine, (virtualmachine, args, reportViolation) => {
            if (virtualmachine.osProfile) {
                if (virtualmachine.osProfile.linuxConfiguration) {
                    if (!virtualmachine.osProfile.linuxConfiguration.disablePasswordAuthentication) {
                        reportViolation("Authentication to Linux machines should require SSH keys.");
                    }
                }
            }
        }),
    },
    vendors: ["azure"],
    services: ["compute"],
    severity: "high",
    topics: ["security", "authentication"],
    frameworks: ["pcidss"],
});
