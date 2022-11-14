import * as aws from "@pulumi/aws";
import { PolicyPack } from "@pulumi/policy";
import securityGroupPolicies from "./securityGroup";
import network from "./network";
import volumes from "./volumes";

new PolicyPack("aws", {
  policies: [...securityGroupPolicies, ...network, ...volumes],
});
