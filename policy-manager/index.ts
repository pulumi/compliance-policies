// Copyright 2016-2022, Pulumi Corporation.
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

export * from "./version";

import * as policy from "@pulumi/policy";
import { loadPlugins } from "./plugin";

export { loadPlugins } from "./plugin";

/**
 * Represents the arguments for selecting policies.
 */
export interface FilterPolicyArgs {
    /**
     * An array of vendor names to select policies by.
     */
    vendors?: string[];

    /**
     * An array of service names to select policies by.
     */
    services?: string[];

    /**
     * An array of compliance framework names to select policies by.
     */
    frameworks?: string[];

    /**
     * An array of severity levels to select policies by.
     */
    severities?: string[];

    /**
     * An array of topics to select policies by.
     */
    topics?: string[];
};

/**
 * Represents the arguments for displaying policy selection statistics.
 */
export interface DisplaySelectionStatsArgs {
    /**
     * If set to `true`, displays general statistics about the number of registered policies, how many have been selected and how many remain in the pool.
     */
    displayGeneralStats: boolean;
    /**
     * If `true` then shows information about included policy modules and their version.
     */
    displayModuleInformation?: boolean;
    /**
     * If `true` then shows the name of the policies that have been included in the Policy Pack at runtime and the associated enforcement level.
     */
    displaySelectedPolicyNames?: boolean;
};

/**
 * Metadata associated with a policy.
 */
export interface PolicyMetadata {
    /**
     * An array of vendor names associated with the policy.
     */
    vendors?: string[];
    /**
     * An array of service names associated with the policy.
     */
    services?: string[];
    /**
     * An array of compliance framework names associated with the policy.
     */
    frameworks?: string[];
    /**
     * The severity level of the policy.
     */
    severity?: string;
    /**
     * An array of topics related to the policy.
     */
    topics?: string[];
};

/**
 * Represents the arguments for registering a policy.
 */
export interface RegisterPolicyArgs extends PolicyMetadata {
    /**
     * The resource validation policy to be associated with the registered policy.
     */
    resourceValidationPolicy: policy.ResourceValidationPolicy;
};

/**
 * Represents information about a policy.
 */
export interface PolicyInfo {
    /**
     * The name of the policy.
     */
    policyName: string;

    /**
     * The resource validation policy associated with the policy.
     */
    resourceValidationPolicy: policy.ResourceValidationPolicy;

    /**
     * Metadata associated with the policy.
     */
    policyMetadata: PolicyMetadata;
};

/**
 * Represents information about a policy package.
 */
export interface ModuleInfo {
    /**
     * The name of the policy package.
     */
    name: string;
    /**
     * The version of the policy package.
     */
    version: string;
};

export interface PolicyManagerStats {
    /**
     * The value of `policyCount` represents the total number of registered policies.
     */
    policyCount: number;
    /**
     * The value of `remainingPolicyCount` represents the number of policies available for selection.
     * You may call `resetPolicyfilter()` to reset the selection filter, however, be aware that you may get duplicated policies.
     */
    remainingPolicyCount: number;
    /**
     * The value of `selectedPoliciesCount` represents the number of policies that have already been provider by `selectPolicies()`.
     */
    selectedPoliciesCount: number;
    /**
     * `selectedPolicies` contains all the polcy that have been selected. Calling `resetPolicySelector()` will empty this list.
     */
    selectedPolicies: policy.ResourceValidationPolicy[];

    /**
     * `registeredModules` contains information about policy modules that have registered themselves.
     */
    registeredModules: ModuleInfo[];
}

/**
 * Class to manage policies.
 */
export class PolicyManager {

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
     * An array of registered policies that haven't been returned yet via `selectPolicies()`.
     * This is needed to ensure users get policies only once so the Pulumi service doesn't
     * complain about duplicated policies.
     */
    private remainingPolicies: PolicyInfo[] = [];

    /**
     * An array of policy names that have been returned via `selectPolicies()`.
     * This is used to return by `getStats()` so it's possible to know the list
     * of policies that have been selected.
     */
    private selectedPolicies: policy.ResourceValidationPolicy[] = [];

    /**
     * An array containing the list of registered modules.
     */
    private registeredModules: ModuleInfo[] = [];

    /**
     * The function `getSelectionStats()` returns statistics about the number of registered
     * policies as well as the names and count of already selected policies and the number
     * of policies that haven't been selected yet.
     *
     * @returns Returns a populated `PolicyManagerStats`.
     */
    public getSelectionStats(): PolicyManagerStats {
        return {
            policyCount: this.allPolicies.length,
            remainingPolicyCount: this.remainingPolicies.length,
            selectedPoliciesCount: this.selectedPolicies.length,
            selectedPolicies: [...this.selectedPolicies],
            registeredModules: [...this.registeredModules],
        };
    }

    /**
     * This function `displaySelectionStats()` displays general statistics about policies
     * that have been returned by `selectPolicies()` and how many remain in the pool.
     * Additional information about registered policy modules are displayed too.
     * @returns No value is returned.
     */
    public displaySelectionStats(args: DisplaySelectionStatsArgs): void {
        const stats = this.getSelectionStats();

        let message: string = "";

        if (args.displayGeneralStats) {
            message += `Total registered policies: ${stats.policyCount}\n`;
            message += `Selected policies: ${stats.selectedPoliciesCount}\n`;
            message += `Remaining (unselected) policies: ${stats.remainingPolicyCount}\n`;
        }
        if (args.displayModuleInformation) {
            if (args.displayGeneralStats) {
                message += "---\n";
            }
            message += "Included policy packages:\n";
            for(let x = 0; x < stats.registeredModules.length; x++) {
                message += `  ${stats.registeredModules[x].name}: ${stats.registeredModules[x].version}\n`;
            }
        }

        if (args.displaySelectedPolicyNames) {
            if (args.displayGeneralStats || args.displayModuleInformation) {
                message += "---\n";
            }
            message += "Selected policies:\n";
            for (let x = 0; x < stats.selectedPolicies.length; x++) {
                message += `  ${stats.selectedPolicies[x].name}: enforcementLevel: ${stats.selectedPolicies[x].enforcementLevel}\n`;
            }
        }

        console.error(message);

        return;
    }

    /**
     * When executing the policy selector, it's crucial for the function to return each policy
     * exactly once. This ensures that the Pulumi service doesn't return an error related to
     * duplicated policies when a Policy Pack is published.
     *
     * The purpose of this function is to reset the policy filter, enabling a fresh start.
     * Consequently, when you invoke `selectPolicies()`, it will take into account all the
     * registered policies including the ones previously selected. This may add previously
     * selected policies to your Policy Pack.
     *
     * This function for unit tests purpose and most users/developers shouldn't use it.
     */
    public resetPolicySelector(): void {
        this.remainingPolicies = [...this.allPolicies];
        this.selectedPolicies = [];
    }

    /**
     * This function returns a resource policy information by providing the policy
     * name.
     *
     * This function for unit tests purpose and most users/developers shouldn't use it.
     *
     * **Note**: The returned policy is not removed from the pool of available policies.
     * If you want to select an individual policy, then you should be using
     * `selectPolicyByName()` instead.
     *
     * @param name The policy name to search for and return.
     * @returns The PolicyInfo if found, otherwise `undefined`.
     */
    public getPolicyByName(name: string): PolicyInfo | undefined {

        if(!name) {
            return undefined;
        }

        const match: PolicyInfo | undefined = this.allPolicies.find((pol) => {
            if (pol.policyName === name) {
                return true;
            }
            return false;
        });

        if (!match) {
            return undefined;
        }
        return match;
    }

    /**
     * This function searches for a policy based on the provided `name`. If the
     * policy is found, then it is removed from the pool of available policies
     * and the policy is returned. If not found, the `undefined` is returned.
     *
     * @param name The policy name to search for and return.
     * @param enforcementLevel The desired policy enforcement Level. Valid values are `advisory`, `mandatory` and `disabled`.
     * @returns A `ResourceValidationPolicy` policy that matched the supplied `name` or `undefined` if the policy wasn't found in the pool of `remainingPolicies`.
     */
    public selectPolicyByName(name: string, enforcementLevel?: string): policy.ResourceValidationPolicy | undefined {
        if(!name) {
            return undefined;
        }

        const policyIndex: number = this.remainingPolicies.findIndex((candidate) => {
            if (candidate.policyName === name) {
                return true;
            }
            return false;
        });

        if (policyIndex >= 0) {
            /*
             * We need to deep clone the entire policy to avoid changing
             * the enforcement level set by the policy developer. However,
             * It's not possible to use `structuredClone()` to clone because
             * the policy code cannot be serialized. So instead, we manually
             * assign each value and set the enforcementLevel last.
             */
            const pol: policy.ResourceValidationPolicy = {
                name: this.remainingPolicies[policyIndex].resourceValidationPolicy.name,
                description: this.remainingPolicies[policyIndex].resourceValidationPolicy.description,
                configSchema: this.remainingPolicies[policyIndex].resourceValidationPolicy.configSchema,
                validateResource: this.remainingPolicies[policyIndex].resourceValidationPolicy.validateResource,
                enforcementLevel: this.remainingPolicies[policyIndex].resourceValidationPolicy.enforcementLevel,
            };
            if (enforcementLevel === "advisory" || enforcementLevel === "mandatory" || enforcementLevel === "disabled") {
                pol.enforcementLevel = enforcementLevel;
            }

            /*
             * We also take the opportunity to capture the policy name and
             * store it if the user wants to know which policies have been
             * used to create their Policy Pack.
             */
            this.selectedPolicies.push(pol);

            /*
             * We remove the selected policy from the pool of available policies.
             */
            this.remainingPolicies.splice(policyIndex, 1);
            return pol;
        }
        return undefined;
    }

    /**
     * Select policies based on criterias provided as arguments. The selectiopn filter only
     * returns policies that match selection criterias. Effectively, this function performs
     * an `or` operation within each selection criteria, and an `and` operation between
     * selection criterias.
     *
     * You may also provide an array of cherry-picked polcies. The function takes care of
     * removing duplicates as well as ignoring already selected policies from previous calls.
     *
     * Note: Criterias are all case-insensitive.
     * Note: Call `resetPolicyfilter()` to reset the selection filter and consider all
     * policies again.
     *
     * @param args A bag of options containing the selection criterias, or an array of
     * cherry-picked policies.
     * @param enforcementLevel The desired policy enforcement Level. Valid values are `advisory`, `mandatory` and `disabled`.
     * @returns An array of ResourceValidationPolicy policies that matched with the selection criterias.
     */
    public selectPolicies(args: FilterPolicyArgs | policy.ResourceValidationPolicy[], enforcementLevel?: string): policy.ResourceValidationPolicy[] {

        const results: policy.ResourceValidationPolicy[] = [];
        /*
         * We make a deep copy to avoid interactions between 2
         * variables but on the same array.
         */
        let matches: PolicyInfo[] = [...this.remainingPolicies];
        // let matches: PolicyInfo[] = [];

        if (typeof args === "object" && ("vendors" in args || "services" in args || "frameworks" in args || "severities" in args || "topics" in args) ) {
            /*
             * We have a `FilterPolicyArgs` type
             */
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

            if ((!args.vendors || args.vendors.length <= 0) &&
                (!args.services || args.services.length <= 0) &&
                (!args.frameworks || args.frameworks.length <= 0) &&
                (!args.topics || args.topics.length <= 0) &&
                (!args.severities || args.severities.length <= 0)) {
                /**
                 * no selection criteria were supplied, so we need to
                 * return an empty selection.
                 */
                matches = [];
            }

        } else if (typeof args === "object" && "length" in args ) {
            /*
             * We have an `array` type
             */
            let tmpMatches: PolicyInfo[] = [];
            for (let x = 0; x < args.length; x++) {
                const policyName = args[x].name;
                tmpMatches = tmpMatches.concat(matches.filter((candidatePolicy) => {
                    return candidatePolicy.policyName === policyName;
                }));
            }

            /*
             * As we now have all the user supplied policies that were still available
             * in the remaining pool, we need to remove any duplicates.
             */
            tmpMatches = tmpMatches.filter((value, index, self) => {
                return index === self.findIndex((obj) => (
                    obj.policyName === value.policyName
                ));
            });

            matches = tmpMatches;

        } else {
            /**
             * We can't be 100% sure of the type, so we assume we got an empty
             * `FilterPolicyArgs` and simply return no selection.
             */
            matches = [];
        }

        /*
         * At this point, `matches` contains only the polcies that have matches
         * the user submitted criterias or their cherry-picking selection. We
         * should remove them from the `this.remainingPolicies[]` to avoid
         * duplicates when calling the next `filterPolicies()`.
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

        /*
         * Now `matches` only contains policies that haven't been selected before.
         */
        matches.forEach((match) => {
            /*
             * We need to deep clone the entire policy to avoid changing
             * the enforcement level set by the policy developer. However,
             * It's not possible to use `structuredClone()` to clone because
             * the policy code cannot be serialized. So instead, we manually
             * assign each value and set the enforcementLevel last.
             */
            const pol: policy.ResourceValidationPolicy = {
                name: match.resourceValidationPolicy.name,
                description: match.resourceValidationPolicy.description,
                configSchema: match.resourceValidationPolicy.configSchema,
                validateResource: match.resourceValidationPolicy.validateResource,
                enforcementLevel: match.resourceValidationPolicy.enforcementLevel,
            };
            if (enforcementLevel === "advisory" || enforcementLevel === "mandatory" || enforcementLevel === "disabled") {
                pol.enforcementLevel = enforcementLevel;
            }
            results.push(pol);

            /*
             * We also take the opportunity to capture the policy name and
             * store it if the user wants to know which policies have been
             * used to create their Policy Pack.
             */
            this.selectedPolicies.push(pol);
        });

        return results;
    }

    /**
     * Register a new policy into the pool of policies. The policy name must be
     * unique to the pool of policies already registered or an exception is thrown.
     *
     * This function is used if you are authoring your own Premium Policies.
     *
     * @param args An object containing the policy to register as well as its additional attributes.
     * @returns a `ResourceValidationPolicy` object.
     */
    public registerPolicy(args: RegisterPolicyArgs): policy.ResourceValidationPolicy {

        if (this.allNames.includes(args.resourceValidationPolicy.name)) {
            throw new Error(`Another policy with the name '${args.resourceValidationPolicy.name}' already exists. Either register the policy only once, or ensure policy names are unique.`);
        }

        this.allNames.push(args.resourceValidationPolicy.name);

        const policyInfo: PolicyInfo = {
            policyName: args.resourceValidationPolicy.name,
            resourceValidationPolicy: args.resourceValidationPolicy,
            policyMetadata: {
                frameworks: args.frameworks,
                services: args.services,
                severity: args.severity,
                topics: args.topics,
                vendors: args.vendors,
            },
        };

        this.allPolicies.push(policyInfo);
        /*
         * We make a deep copy of the array below to ensure `this.allPolicies`
         * is saved in its own instance. This is necessary to ensure
         * `this.allPolicies` is never affected by operations done on
         * `this.remainingPolicies`.
         */
        this.remainingPolicies = [...this.allPolicies];

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

        return args.resourceValidationPolicy;
    }

    /**
     * This function is used by policy module to register information about themselves.
     * This can be later used to display statistics about included packages as part of
     * a policy-pack.
     *
     * This function is to be used if you are authoring your own Premium Policies.
     *
     * @param name Name of the policy module as stored in `package.json`
     * @param version The module version as stored in `package.json`
     * @returns returns the package version as a string
     */
    public registerPolicyModule(name: string, version: string): string {
        this.registeredModules.push({
            name: name,
            version: version,
        });
        return version;
    }
};

/**
 * An instance of the `PolicyManager` class.
 *
 * Use this instance to manipulate (register, select...) policies.
 */
export const policyManager: PolicyManager = new PolicyManager();

/**
 * The function `valToBoolean()` is a helper because some boolean properties
 * require a string type instead of a boolean type.
 * The idea for this function is to allow compatibility across multiple versions
 * of the same provider in case a property type changes from string to boolean.
 *
 * @link https://github.com/pulumi/pulumi-aws/issues/2257
 * @param val A value to convert into a boolean.
 * @returns The boolean value, or `undefined` is the conversion isn't possible.
 */
// Help to help with boolean stored as string
// see https://github.com/pulumi/pulumi-aws/issues/2257
export function valToBoolean(val: boolean | string | undefined): boolean | undefined {
    switch (typeof val) {
    case "undefined":
        return undefined;
    case "boolean":
        return val;
    case "string":
        switch(val.toLowerCase()) {
        case "false":
            return false;
        case "true":
            return true;
        default:
            return undefined;
        }
    default:
        return undefined;
    }
}

(() => {
    // This anonymous function is used to dynamically load official
    // policies that match the pattern shown below. During the loading
    // process, this policy-manager version is compared to the one
    // included in the policy package. An exception is thrown if the
    // values don't match.
    // This is done to ensure that only a single policy-manager exists
    // and all policies are registered in that unique instance.
    loadPlugins(["@pulumi-premium-policies/*-policies"]);
})();
