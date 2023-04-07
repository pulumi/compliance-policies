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
import { ResourceValidationArgs } from "@pulumi/policy";
import { createResourceValidationArgs } from "@pulumi-premium-policies/unit-test-helpers";
import * as azurenative from "@pulumi/azure-native";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(azurenative.workloads.v20211201preview.SAPVirtualInstance, {
        configuration: {
            appLocation: "eastus",
            configurationType: "DeploymentWithOSConfig",
            infrastructureConfiguration: {
                appResourceGroup: "X00-RG",
                applicationServer: {
                    instanceCount: 6,
                    subnetId: "/subscriptions/49d64d54-e966-4c46-a868-1999802b762c/resourceGroups/test-rg/providers/Microsoft.Networks/virtualNetworks/test-vnet/subnets/appsubnet",
                    virtualMachineConfiguration: {
                        imageReference: {
                            offer: "RHEL-SAP",
                            publisher: "RedHat",
                            sku: "7.4",
                            version: "7.4.2019062505",
                        },
                        osProfile: {
                            adminUsername: "{your-username}",
                            osConfiguration: {
                                disablePasswordAuthentication: true,
                                osType: "Linux",
                                sshKeyPair: { privateKey: "xyz", publicKey: "abc" },
                            },
                        },
                        vmSize: "Standard_E32ds_v4",
                    },
                },
                centralServer: {
                    instanceCount: 1,
                    subnetId: "/subscriptions/49d64d54-e966-4c46-a868-1999802b762c/resourceGroups/test-rg/providers/Microsoft.Networks/virtualNetworks/test-vnet/subnets/appsubnet",
                    virtualMachineConfiguration: {
                        imageReference: {
                            offer: "RHEL-SAP",
                            publisher: "RedHat",
                            sku: "7.4",
                            version: "7.4.2019062505",
                        },
                        osProfile: {
                            adminUsername: "{your-username}",
                            osConfiguration: {
                                disablePasswordAuthentication: true,
                                osType: "Linux",
                                sshKeyPair: { privateKey: "xyz", publicKey: "abc" },
                            },
                        },
                        vmSize: "Standard_E16ds_v4",
                    },
                },
                databaseServer: {
                    databaseType: "HANA",
                    instanceCount: 1,
                    subnetId: "/subscriptions/49d64d54-e966-4c46-a868-1999802b762c/resourceGroups/test-rg/providers/Microsoft.Networks/virtualNetworks/test-vnet/subnets/dbsubnet",
                    virtualMachineConfiguration: {
                        imageReference: {
                            offer: "RHEL-SAP",
                            publisher: "RedHat",
                            sku: "7.4",
                            version: "7.4.2019062505",
                        },
                        osProfile: {
                            adminUsername: "{your-username}",
                            osConfiguration: {
                                disablePasswordAuthentication: true,
                                osType: "Linux",
                                sshKeyPair: { privateKey: "xyz", publicKey: "abc" },
                            },
                        },
                        vmSize: "Standard_M32ts",
                    },
                },
                deploymentType: "ThreeTier",
            },
            osSapConfiguration: { sapFqdn: "xyz.test.com" },
        },
        environment: "Prod",
        sapProduct: "S4HANA",
        resourceGroupName: "",
    });
}
