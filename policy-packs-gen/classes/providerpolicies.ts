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

import * as fs from "fs";
import * as path from "path";
import * as premiumPolicy from "./premiumpolicy";

export interface ProviderPoliciesArgs {
    /**
     * Base directory containing the vendor's policies.
     */
    vendorDir: string;
    /**
     * The provider's directory to process within vendorDir that contains all the policies.
     */
    providerDir: string;
};

export class ProviderPolicies {

    private args: ProviderPoliciesArgs;

    public readonly vendors: string[];
    public readonly services: string[];
    public readonly severities: string[];
    public readonly topics: string[];
    public readonly frameworks: string[];

    /*
     * pulumi policy new (aws|azure|google|kubernetes)-premium-policies-(pcidss|iso27001|cis)
     */

    /**
     * Class constructor.
     *
     * @param args Required class arguments.
     */
    constructor(args: ProviderPoliciesArgs) {
        this.args = args;

        const vendors: string[] = [];
        const services: string[] = [];
        const severities: string[] = [];
        const topics: string[] = [];
        const frameworks: string[] = [];

        const dirPath: string = path.join(this.args.vendorDir, this.args.providerDir);
        if (! fs.existsSync(dirPath) || ! fs.statSync(dirPath).isDirectory() ) {
            throw new Error(`The directory ${dirPath} isn't a directory or is doesn't exists.`);
        }
        const policyFiles: string[] = this.findFilesByExtension(dirPath, ".ts");

        const premiumPolicies: premiumPolicy.PremiumPolicy[] = [];
        for (let x = 0; x < policyFiles.length; x++) {
            const p: premiumPolicy.PremiumPolicy = new premiumPolicy.PremiumPolicy({
                policyFile: policyFiles[x],
            });
            premiumPolicies.push(p);

            if (p.vendors && p.vendors.length > 0) {
                vendors.push(...p.vendors);
            }

            if (p.services && p.services.length > 0) {
                services.push(...p.services);
            }

            if (p.severity && p.severity.length > 0) {
                severities.push(p.severity);
            }

            if (p.topics && p.topics.length > 0) {
                topics.push(...p.topics);
            }

            if (p.frameworks && p.frameworks.length > 0) {
                frameworks.push(...p.frameworks);
            }
        }

        this.vendors = [...new Set(vendors)].sort();
        this.services = [...new Set(services)].sort();
        this.severities = [...new Set(severities)].sort();
        this.topics = [...new Set(topics)].sort();
        this.frameworks = [...new Set(frameworks)].sort();
    }

    /**
     * This function scans a given directory for files with a matching extensions and returns the results as an array.
     *
     * @param directory A path to an existing directory to find files in.
     * @param extension The desired file extension to look for.
     * @returns An array of files.
     */
    private findFilesByExtension(directory: string, extension: string): string[] {
        const files: string[] = [];

        const dirContent = fs.readdirSync(directory);

        for (let index = 0; index < dirContent.length; index++) {
            const file = dirContent[index];
            const fullPath = path.join(directory, file);

            if (fs.statSync(fullPath).isDirectory()) {
                files.push(...this.findFilesByExtension(fullPath, extension));
            } else if (path.extname(file) === extension) {
                if (path.basename(file) !== "index.ts") {
                    files.push(fullPath);
                }
            }
        }
        return files;
    }

};
