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

import { policyRegistrations } from "./utils";
export * as aws from "./aws";
export * as awsNative from "./aws-native";
export * as kubernetes from "./kubernetes";

console.info(`Number of registered policies: ${policyRegistrations.getStats()}.`); // eslint-disable-line no-console

let selection = policyRegistrations.filterPolicies({
    vendors: ["awS", "kubErnetes"],
    // severities: ["criTical"],
});
console.info(`Number of selected policies: ${selection.length}.`);  // eslint-disable-line no-console

selection = policyRegistrations.filterPolicies({
    vendors: ["kubErnetes"],
});
console.info(`Number of selected policies: ${selection.length}. Should be 0.`);  // eslint-disable-line no-console

policyRegistrations.resetPolicyfilter();
selection = policyRegistrations.filterPolicies({
    vendors: ["kubErnetes"],
});
console.info(`Number of selected policies: ${selection.length}. Should be > 0.`);  // eslint-disable-line no-console
