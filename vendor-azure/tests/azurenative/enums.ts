// Copyright 2016-2025, Pulumi Corporation.
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

export enum resourcegroup {
    ResourceGroupName = "ressourceGroupName",
    Location = "westeurope",
}

export enum keyvault {
    SourceVaultId = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/ressourceGroupName/providers/Microsoft.KeyVault/vaults/ressourceGroupName",
    SecretUrl = "https://ressourceGroupName.vault.azure.net/secrets/ressourceGroupName/00000000000000000000000000000000",
}
