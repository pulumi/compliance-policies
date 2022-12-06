import "mocha";
import { assertHasResourceViolation, assertNoResourceViolations, assetResourcePolicyIsRegistered, assetResourcePolicyRegistrationDetails, createResourceValidationArgs } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.eks.Cluster, {

        
    }