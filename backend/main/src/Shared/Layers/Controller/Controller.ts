import { APIGatewayProxyResultV2 } from "aws-lambda";
import { LambdaUrlHttpResponse } from "src/Shared/Layers/Controller/LambdaUrlHttpResponse";

export abstract class LambdaProxyController extends LambdaUrlHttpResponse {
	protected abstract handler(): Promise<APIGatewayProxyResultV2>;

	public async execute() {
		try {
			return await this.handler();
		} catch (err) {
			if (err instanceof Error) {
				console.error(err.message);
				return this;
			}
		}
	}
}
