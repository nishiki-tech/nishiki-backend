import {LambdaUrlHttpResponse} from "src/Shared/Layers/Controller/LambdaUrlHttpResponse";
import {Err} from "src/Shared";

export abstract class LambdaProxyController extends LambdaUrlHttpResponse {

    protected abstract handler(): Promise<any>;

    public async execute() {
        try {
            return await this.handler();
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                return this
            }
        }
    }

}