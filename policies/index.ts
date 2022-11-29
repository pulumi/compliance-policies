// Copyright 2016-2022, Pulumi Corporation.
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

export { policyRegistrations } from "./utils";
export * from "./version";

export * as aws from "./aws";
export * as kubernetes from "./kubernetes";


// import { policyRegistrations } from "./utils";
// console.info(`Number of registered policies: ${policyRegistrations.getStats()}.`);

// const selection = policyRegistrations.filterPolicies({
//     vendors: ["aWs", "kubernetes"],
//     severities: ["criTical"],
// });
// console.info(`Number of selected policies: ${selection.length}.`);