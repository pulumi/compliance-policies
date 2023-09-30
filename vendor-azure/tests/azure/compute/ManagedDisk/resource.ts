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
import { createResourceValidationArgs } from "@pulumi-premium-policies/unit-test-helpers";
import { ManagedDisk } from "@pulumi/azure/compute";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(ManagedDisk, {
        name: "test-disk",
        resourceGroupName: enums.resourcegroup.ResourceGroupName,
        location: enums.resourcegroup.Location,
        storageAccountType: "Standard_LRS",
        createOption: "Empty",
        diskSizeGb: 10,
        encryptionSettings: {
            diskEncryptionKey: {
                secretUrl: enums.keyvault.SecretUrl,
                sourceVaultId: enums.keyvault.SourceVaultId,
            },
            keyEncryptionKey: {
                keyUrl: enums.keyvault.KeyUrl,
                sourceVaultId: enums.keyvault.SourceVaultId,
            },
        },
    });
}
