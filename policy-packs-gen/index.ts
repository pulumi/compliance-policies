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

import * as path from "path";
import * as commander from "commander";
import * as eta from "eta";
import * as providerPolicies from "./classes/providerpolicies";
import * as policyPackGenerator from "./classes/policypackgenerator";

interface RunArgs {
    /**
     * A directory containing a vendor's policies.
     */
    vendorDir: string;
    /**
     * Name of the vendor.
     */
    vendorName: string;
    /**
     * An array of provider directories to process within vendorDir.
     */
    providersDirs: string[];
    /**
     * Path where to save the generated Policy packs.
     */
    templatesDir: string;
    /**
     * Allow overwriting existing Policy pack templates.
     */
    overwriteTemplates: boolean;
}

/**
 * An entrypoint.
 *
 * @param provider The name of a pulumi provider.
 */
function cmd_run(args: RunArgs) {

    let vendors: string[] = [];
    let services: string[] = [];
    let severities: string[] = [];
    let topics: string[] = [];
    let frameworks: string[] = [];

    const policyProviders: providerPolicies.ProviderPolicies[] = [];
    for (let x = 0; x < args.providersDirs.length; x++) {
        const policyProvider = new providerPolicies.ProviderPolicies({
            vendorDir: args.vendorDir,
            providerDir: args.providersDirs[x],
        });
        policyProviders.push(policyProvider);
        vendors.push(...policyProvider.vendors);
        services.push(...policyProvider.services);
        severities.push(...policyProvider.severities);
        topics.push(...policyProvider.topics);
        frameworks.push(...policyProvider.frameworks);
    }

    /**
     * Make a unique list of metadata for all providers metadata.
     */
    vendors = [...new Set(vendors)];
    services = [...new Set(services)];
    severities = [...new Set(severities)];
    topics = [...new Set(topics)];
    frameworks = [...new Set(frameworks)];

    if (vendors.length !== 1) {
        throw new Error(`Only one vendor should be processed at a given time but found more than one in your policies: '${vendors.toString()}'. Check your policies...`);
    }

    const packGen = new policyPackGenerator.PolicyPackGenerator({
        destinationDir: args.templatesDir,
        overwrite: args.overwriteTemplates,
        vendor: vendors[0],
        services: services,
        severities: severities,
        topics: topics,
        frameworks: frameworks,
    });

    return;
}

/**
 * Display policy-gen version.
 */
function cmd_version() {
    console.log("v0.0.0");
}

/**
 * Allow overwriting policy files that already exist.
 */
commander.program
    .command("run")
    .description("Run the program")
    .requiredOption("--vendor-directory <vendorPath>", "A directory containing a vendor's policies. (`/path/to/premium-policies/vendor-something`)")
    .requiredOption("--vendor-name <vendorName>", "Name of the vendor. (`aws`, or `azure`)")
    .requiredOption("--providers-directories <providerDir>,...", "A coma separated list of providers to process within the vendorPath. (`aws,awsnative`, `kubernetes`)")
    .requiredOption("--templates-directory <templatesPath>", "Path where to save the generated Policy packs. (`/path/to/templates-policy`)")
    .option("--overwrite", "Allow overwriting existing Policy pack templates.")
    .action((options) => {
        const vendorDir: string = (options.vendorDirectory as string);
        const vendorName: string = (options.vendorName as string);
        const providers: string[] = (options.providersDirectories as string).split(",");
        const templatesDir: string = (options.templatesDirectory as string);
        const overwrite: boolean = options.overwrite ? true : false;

        cmd_run({
            vendorDir: vendorDir,
            vendorName: vendorName,
            templatesDir: templatesDir,
            overwriteTemplates: overwrite,
            providersDirs: providers,
        });
    });

commander.program
    .command("version")
    .description("Print policy-packs-gen version")
    .action((options) => {
        cmd_version();
    });

commander.program.parse();

