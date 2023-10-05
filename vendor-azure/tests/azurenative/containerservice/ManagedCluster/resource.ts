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

import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../../enums";
import { createResourceValidationArgs } from "@pulumi/unit-test-helpers";
import { ManagedCluster } from "@pulumi/azure-native/containerservice/managedCluster";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(ManagedCluster, {
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
