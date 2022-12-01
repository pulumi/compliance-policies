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

import {
    ResourceValidationPolicy,
} from "@pulumi/policy";

export interface FilterPolicyArgs {
    vendors?: string[];
    services?: string[];
    frameworks?: string[];
    severities?: string[];
    topics?: string[];
};

export interface RegisterPolicyArgs {
    resourceValidationPolicy: ResourceValidationPolicy;
    vendors?: string[];
    services?: string[];
    frameworks?: string[];
    severity?: string;
    topics?: string[];
};

export interface PolicyInfo {
    policyName: string;
    resourceValidationPolicy: ResourceValidationPolicy;
};

export class RegisteredPolicies {

    /**
     * An array containing all registered policies.
     */
    private readonly allPolicies: PolicyInfo[] = [];

    /**
     * An array containing all registered policy names. This is used to
     * prevent duplicated names since the Pulumi service requires a
     * unique name for each policy.
     */
    private readonly allNames: string[] = [];

    /**
     * A `Record` that contains policies arranged per vendor.
     */
    private readonly vendors: Record<string, PolicyInfo[]> = {};

    /**
     * A `Record` that contains policies arranged per service.
     */
    private readonly services: Record<string, PolicyInfo[]> = {};

    /**
     * A `Record` that contains policies arranged per framework.
     */
    private readonly frameworks: Record<string, PolicyInfo[]> = {};

    /**
     * A `Record` that contains policies arranged per topic.
     */
    private readonly topics: Record<string, PolicyInfo[]> = {};

    /**
     * A `Record` that contains policies arranged per severity.
     */
    private readonly severities: Record<string, PolicyInfo[]> = {};

    /**
     * An array of registered policies that haven't been returned yet via `filterPolicies()`.
     * This is needed to ensure users get policies only once so the Pulumi service doesn't
     * complain about duplicated policies.
     */
    private remainingPolicies: PolicyInfo[] = [];

    public getStats(): number {
        return this.allNames.length;
    }

    /**
     * This function allows to retrieve an individual policy by providing its
     * name as an argument. If the policy is found, then it is return. If the
     * requestes policy doesn't exists, then `undefined` is returned instead.
     *
     * @param name The policy name to search for and return.
     * @returns The ResourceValidationPolicy if found, otherwise `undefined`.
     */
    public getPolicyByName(name: string): ResourceValidationPolicy | undefined {

        if(!name || name.length === 0) {
            return undefined;
        }

        const match: PolicyInfo | undefined = this.allPolicies.find((policy) => {
            if (policy.policyName === name) {
                return true;
            }
            return false;
        });

        if (!match) {
            return undefined;
        }
        return match.resourceValidationPolicy;
    }

    /**
     * Filter policies based on selection criterias provided as arguments.
     * The filter only returns policies that match selection criterias.
     * Effectively, this function performs an `or` operation within each selection
     * criteria, and an `and` operation between selection criterias.
     *
     * Note: Criterias are all case-insensitive.
     * Note: Call `resetPolicyfilter()` to reset the filter and consider all policies again.
     *
     * @param args A bag of options containing the selection criterias.
     * @returns An array of ResourceValidationPolicy policies that matched with the selection criterias.
     */
    public filterPolicies(args: FilterPolicyArgs): ResourceValidationPolicy[] {

        const results: ResourceValidationPolicy[] = [];
        let matches: PolicyInfo[] = this.remainingPolicies;

        if (args.vendors && args.vendors.length > 0 && matches.length > 0) {
            let tmpMatches: PolicyInfo[] = [];
            for(let x = 0; x < args.vendors.length; x++) {
                const vendorName = args.vendors[x].toLowerCase();
                tmpMatches = tmpMatches.concat(matches.filter((candidatePolicy) => {
                    if (!this.vendors[vendorName]) {
                        return false;
                    }
                    const findResult = this.vendors[vendorName].find((vendorPolicy) => {
                        return vendorPolicy.policyName === candidatePolicy.policyName;
                    });
                    if (findResult) {
                        return true;
                    }
                    return false;
                }));
            }
            matches = tmpMatches;
        }

        if (args.services && args.services.length > 0 && matches.length > 0) {
            let tmpMatches: PolicyInfo[] = [];
            for(let x = 0; x < args.services.length; x++) {
                const serviceName = args.services[x].toLowerCase();
                tmpMatches = tmpMatches.concat(matches.filter((candidatePolicy) => {
                    if (!this.services[serviceName]) {
                        return false;
                    }
                    const findResult = this.services[serviceName].find((servicePolicy) => {
                        return servicePolicy.policyName === candidatePolicy.policyName;
                    });
                    if (findResult) {
                        return true;
                    }
                    return false;
                }));
            }
            matches = tmpMatches;
        }

        if (args.frameworks && args.frameworks.length > 0 && matches.length > 0) {
            let tmpMatches: PolicyInfo[] = [];
            for(let x = 0; x < args.frameworks.length; x++) {
                const frameworkName = args.frameworks[x].toLowerCase();
                tmpMatches = tmpMatches.concat(matches.filter((candidatePolicy) => {
                    if (!this.frameworks[frameworkName]) {
                        return false;
                    }
                    const findResult = this.frameworks[frameworkName].find((frameworkPolicy) => {
                        return frameworkPolicy.policyName === candidatePolicy.policyName;
                    });
                    if (findResult) {
                        return true;
                    }
                    return false;
                }));
            }
            matches = tmpMatches;
        }

        if (args.topics && args.topics.length > 0 && matches.length > 0) {
            let tmpMatches: PolicyInfo[] = [];
            for(let x = 0; x < args.topics.length; x++) {
                const topicName = args.topics[x].toLowerCase();
                tmpMatches = tmpMatches.concat(matches.filter((candidatePolicy) => {
                    if (!this.topics[topicName]) {
                        return false;
                    }
                    const findResult = this.topics[topicName].find((topicPolicy) => {
                        return topicPolicy.policyName === candidatePolicy.policyName;
                    });
                    if (findResult) {
                        return true;
                    }
                    return false;
                }));
            }
            matches = tmpMatches;
        }

        if (args.severities && args.severities.length > 0 && matches.length > 0) {
            let tmpMatches: PolicyInfo[] = [];
            for(let x = 0; x < args.severities.length; x++) {
                const severityName = args.severities[x].toLowerCase();
                tmpMatches = tmpMatches.concat(matches.filter((candidatePolicy) => {
                    if (!this.severities[severityName]) {
                        return false;
                    }
                    const findResult = this.severities[severityName].find((severityPolicy) => {
                        return severityPolicy.policyName === candidatePolicy.policyName;
                    });
                    if (findResult) {
                        return true;
                    }
                    return false;
                }));

            }
            matches = tmpMatches;
        }

        /**
         * At this point, `matches` contains only the polcies that have matches
         * the user submitted criterias. We should then remove them from the
         * `this.remainingPolicies[]` to avoid duplicates when calling the next
         * `filterPolicies()`.
         */
        matches.forEach((match) => {
            const matchIndex = this.remainingPolicies.findIndex((candidate) => {
                if (candidate.policyName === match.policyName) {
                    return true;
                }
                return false;
            });
            if (matchIndex >= 0) {
                this.remainingPolicies.splice(matchIndex, 1);
            }
        });

        matches.forEach((match) => {
            results.push(match.resourceValidationPolicy);
        });

        return results;
    }

    /**
     * When running the policy filter, it's important that the function returns a given
     * policy only once so the Pulumi service doesn't complain about duplicated policies.
     * This function, allows to reset the policy filter and start _fresh_ again so
     * invoking `filterPolicies()` will consider all registered policies again.
     */
    public resetPolicyfilter(): void {
        this.remainingPolicies = this.allPolicies;
    }
    /**
     * Register a new policy so the policy can be aggregated into group of policies.
     *
     * @param args An object containing the policy to register as well as its additional attributes.
     */
    public registerPolicy(args: RegisterPolicyArgs): void {

        if (this.allNames.includes(args.resourceValidationPolicy.name)) {
            throw `Another policy with the name '${args.resourceValidationPolicy.name}' already exists. Either register the policy only once, or ensure policy names are unique.`;
        }

        this.allNames.push(args.resourceValidationPolicy.name);

        const policyInfo: PolicyInfo = {
            policyName: args.resourceValidationPolicy.name,
            resourceValidationPolicy: args.resourceValidationPolicy,
        };

        this.allPolicies.push(policyInfo);

        this.remainingPolicies.push(policyInfo);

        args.vendors?.forEach((vendorName) => {
            vendorName = vendorName.toLowerCase();
            if (this.vendors[vendorName] === undefined) {
                this.vendors[vendorName] = [policyInfo];
            } else {
                this.vendors[vendorName].push(policyInfo);
            }
        });

        args.services?.forEach((serviceName) => {
            serviceName = serviceName.toLowerCase();
            if (this.services[serviceName] === undefined) {
                this.services[serviceName] = [policyInfo];
            } else {
                this.services[serviceName].push(policyInfo);
            }
        });

        args.frameworks?.forEach((frameworkName) => {
            frameworkName = frameworkName.toLowerCase();
            if (this.frameworks[frameworkName] === undefined) {
                this.frameworks[frameworkName] = [policyInfo];
            } else {
                this.frameworks[frameworkName].push(policyInfo);
            }
        });

        args.topics?.forEach((topicName) => {
            topicName = topicName.toLowerCase();
            if (this.topics[topicName] === undefined) {
                this.topics[topicName] = [policyInfo];
            } else {
                this.topics[topicName].push(policyInfo);
            }
        });

        if (args.severity && args.severity.length > 0) {
            const severityName = args.severity.toLowerCase();
            if (this.severities[severityName] === undefined) {
                this.severities[severityName] = [policyInfo];
            } else {
                this.severities[args.severity].push(policyInfo);
            }
        }
    }
};

export const policyRegistrations: RegisteredPolicies = new RegisteredPolicies();

