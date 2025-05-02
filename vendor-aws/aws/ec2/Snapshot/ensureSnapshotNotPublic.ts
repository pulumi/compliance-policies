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

import * as aws from "@pulumi/aws";
import { Policy, validateResourceOfType } from "@pulumi/policy";

export const awsEc2SnapshotEnsurePrivate: Policy = {
  name: "aws-ec2-snapshot-ensure-private",
  description: "Ensure EBS snapshots are not public (CIS 2.2.2)",
  enforcementLevel: "mandatory",
  vendors: ["aws"],
  services: ["ec2"],
  severity: "high",
  topics: ["networking", "access-control"],
  frameworks: ["cis"],
  validateResource: validateResourceOfType(
    aws.ec2.Snapshot,
    (resource, args, reportViolation) => {
      if (
        resource.createVolumePermissions &&
        resource.createVolumePermissions.some((p) => p.group === "all")
      ) {
        reportViolation(`Snapshot ${resource.id} is publicly accessible.`);
      }
    },
  ),
};
