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
import { PolicyConfigSchemaArgs } from "@pulumi/compliance-policy-manager";
import { createResourceValidationArgs } from "@pulumi/compliance-policies-unit-test-helpers";
import { PatchDeployment } from "@pulumi/google-native/osconfig/v1beta";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(resourceName?: string, policyconfig?: PolicyConfigSchemaArgs): ResourceValidationArgs {
    return createResourceValidationArgs(PatchDeployment, {
        instanceFilter: {},
        oneTimeSchedule: {
            executeTime: "",
        },
        patchDeploymentId: "",
        recurringSchedule: {
            frequency: "FREQUENCY_UNSPECIFIED",
            monthly: {
                monthDay: 1,
                weekDayOfMonth: {
                    dayOfWeek: "DAY_OF_WEEK_UNSPECIFIED",
                    weekOrdinal: 1,
                },
            },
            timeOfDay: {},
            timeZone: {},
            weekly: {
                dayOfWeek: "DAY_OF_WEEK_UNSPECIFIED",
            },
        },
    }, policyconfig, resourceName);
}
