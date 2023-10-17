import {LambdaUrlHttpResponse} from "src/Shared/Layers/Controller/LambdaUrlHttpResponse";
import {Err, IUseCase} from "src/Shared";
import {APIGatewayProxyResultV2} from "aws-lambda";

export abstract class LambdaProxyController<T> extends LambdaUrlHttpResponse {

    protected abstract handler(input?: T): Promise<APIGatewayProxyResultV2>;

    public async execute(): Promise<APIGatewayProxyResultV2> {
        try {
            return await this.handler();
        } catch (err) {

            if (err instanceof Error) {
                console.error(err.message);
                return this.internalServerError(err.message);
            }

            return this.internalServerError("unexpected error")
        }
    }

}