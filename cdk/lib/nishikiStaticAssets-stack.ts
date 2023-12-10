import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
	AttributeType,
	BillingMode,
	ProjectionType,
	Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Stage } from "../utils";

/**
 * If the stage is not prod, add "-dev" to the every asset's name.
 */
interface IProps extends StackProps {
	readonly stage: Stage;
}

export class NishikiStaticAssetsStack extends Stack {
	public readonly nishikiTable: Table;

	constructor(scope: Construct, id: string, props: IProps) {
		super(scope, id, props);

		const { stage } = props;

		const nishikiTable = new Table(this, "NishikiTable", {
			tableName: `nishiki-table-${stage}-db`,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: {
				name: "PK",
				type: AttributeType.STRING,
			},
			sortKey: {
				name: "SK",
				type: AttributeType.STRING,
			},
			removalPolicy:
				stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
		});

		nishikiTable.addGlobalSecondaryIndex({
			indexName: "UserAndGroupRelationship",
			partitionKey: {
				name: "GroupId",
				type: AttributeType.STRING,
			},
			sortKey: {
				name: "UserId",
				type: AttributeType.STRING,
			},
			projectionType: ProjectionType.KEYS_ONLY,
		});

		nishikiTable.addGlobalSecondaryIndex({
			indexName: "JoinLink",
			partitionKey: {
				name: "GroupId",
				type: AttributeType.STRING,
			},
			sortKey: {
				name: "LinkExpiredDatetime",
				type: AttributeType.STRING,
			},
			projectionType: ProjectionType.KEYS_ONLY,
		});
	}
}
