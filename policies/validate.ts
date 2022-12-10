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
export * as awsnative from "./awsnative";
export * as kubernetes from "./kubernetes";

console.info(`Number of registered policies: ${policyRegistrations.getStats()}.`); // eslint-disable-line no-console

const awsSelection = policyRegistrations.filterPolicies({vendors: ["awS"] });
console.info(`Number of AWS policies: ${awsSelection.length}.`);  // eslint-disable-line no-console
policyRegistrations.resetPolicyfilter();

const k8sSelection = policyRegistrations.filterPolicies({vendors: ["KuBernetes"] });
console.info(`Number of K8s policies: ${k8sSelection.length}.`);  // eslint-disable-line no-console
policyRegistrations.resetPolicyfilter();

const sevCritical = policyRegistrations.filterPolicies({severities: ["critical"] });
console.info(`Number of 'critical' severity policies: ${sevCritical.length}.`);  // eslint-disable-line no-console
policyRegistrations.resetPolicyfilter();

const sevHigh = policyRegistrations.filterPolicies({severities: ["high"] });
console.info(`Number of 'high' severity policies: ${sevHigh.length}.`);  // eslint-disable-line no-console
policyRegistrations.resetPolicyfilter();

const sevMedium = policyRegistrations.filterPolicies({severities: ["medium"] });
console.info(`Number of 'medium' severity policies: ${sevMedium.length}.`);  // eslint-disable-line no-console
policyRegistrations.resetPolicyfilter();

const sevLow = policyRegistrations.filterPolicies({severities: ["low"] });
console.info(`Number of 'low' severity policies: ${sevLow.length}.`);  // eslint-disable-line no-console
policyRegistrations.resetPolicyfilter();

const frameworkPciDss = policyRegistrations.filterPolicies({frameworks: ["pcidss"] });
console.info(`Number of 'pcidss' policies: ${frameworkPciDss.length}.`);  // eslint-disable-line no-console
policyRegistrations.resetPolicyfilter();

const frameworkSoc2 = policyRegistrations.filterPolicies({frameworks: ["soc2"] });
console.info(`Number of 'soc2' policies: ${frameworkSoc2.length}.`);  // eslint-disable-line no-console
policyRegistrations.resetPolicyfilter();
