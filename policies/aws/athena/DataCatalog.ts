// Copyright 2016-2023, Pulumi Corporation.
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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "../../utils";

/**
 * Checks that Athena DataCatalogs have a description.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/athena/latest/ug/understanding-tables-databases-and-the-data-catalog.html
 */
export const missingDescription: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-athena-datacatalog-missing-description",
        description: "Checks that Athena DataCatalogs have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.athena.DataCatalog, (dataCatalog, args, reportViolation) => {
            if (!dataCatalog.description) {
                reportViolation("Athena DataCatalogs should have a description.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "low",
    topics: ["documentation"],
});
