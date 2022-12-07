import "mocha";
import { assertHasResourceViolation, assertNoResourceViolations, assetResourcePolicyIsRegistered, assetResourcePolicyRegistrationDetails, createResourceValidationArgs } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.eks.Cluster, {
        vpcId: "vpc-0123456789",
        publicSubnetIds: "subnet-012345",
        privateSubnetIds: "subnet-98765",
        nodeAssociatePublicIpAddress: false,

    });
}

describe("aws.eks.Cluster.disallowPublicIP", () => {
    const policy = policies.aws.eks.Cluster.disallowPublicIP;

    it("disallowPublicIP #1", async () => {
        assetResourcePolicyIsRegistered(policy);
    });

    it("disallowPublicIP #2", async () => {
        assetResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["eks"],
            severity: "high",
            topics: ["network"],
        });
    });

    it("disallowPublicIP #3", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("disallowPublicIP #4", async () => {
        const args = getResourceValidationArgs();
        args.props.associatePublicIpAddress = true;
        await assertHasResourceViolation(policy, args, { message: "EKS Clusters should not have a public IP address." });
    });
});