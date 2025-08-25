import { ResourceValidationArgs } from "@pulumi/policy";
import { Table } from "@pulumi/aws/dynamodb";

export function getResourceValidationArgs(name: string = "example", config?: any): ResourceValidationArgs<Table> {
    return {
        type: "aws:dynamodb/table:Table",
        name: name,
        props: {
            name: "example-table",
            attributes: [
                {
                    name: "id",
                    type: "S"
                }
            ],
            hashKey: "id",
            billingMode: "PAY_PER_REQUEST",
            deletionProtectionEnabled: true,
        },
        urn: `urn:pulumi:stack::project::aws:dynamodb/table:Table::${name}`,
        config: config,
    };
}