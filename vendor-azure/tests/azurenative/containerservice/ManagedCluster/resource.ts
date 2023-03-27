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
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../../enums";
import { createResourceValidationArgs } from "@pulumi-premium-policies/unit-test-helpers";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(azure.containerservice.ManagedCluster, {
        resourceGroupName: enums.resourcegroup.ResourceGroupName,
        location: enums.resourcegroup.Location,
        addonProfiles: {},
        agentPoolProfiles: [{
            availabilityZones: [
                "1",
                "2",
                "3",
            ],
            count: 3,
            enableNodePublicIP: true,
            mode: "System",
            name: "nodepool1",
            osType: "Linux",
            type: "VirtualMachineScaleSets",
            vmSize: "Standard_DS1_v2",
        }],
        dnsPrefix: "dnsprefix1",
        identity: {
            type: "SystemAssigned",
        },
        networkProfile: {
            networkPolicy: "calico",
            loadBalancerProfile: {
                managedOutboundIPs: {
                    count: 2,
                },
            },
            loadBalancerSku: "standard",
            outboundType: "loadBalancer",
        },
        resourceName: "clustername1",
        servicePrincipalProfile: {
            clientId: "clientid",
            secret: "secret",
        },
        sku: {
            name: "Basic",
            tier: "Free",
        },
    });
}
