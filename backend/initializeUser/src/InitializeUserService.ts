import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";

export interface IInitializeUserProps {
	name: string;
	emailAddress: string;
}

export interface IInitializeUserService {
	execute(props: IInitializeUserProps): Promise<Response>;
}

export class InitializeUserService implements IInitializeUserService {
	async execute(props: IInitializeUserProps): Promise<Response> {
		const lambdaFunctionUrl = process.env.LAMBDA_FUNCTION_URL as string;
		const apiUrl = new URL(`${lambdaFunctionUrl}users`);

		const accessKeyId = process.env.AWS_ACCESS_KEY_ID as string;
		const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string;
		const sessionToken = process.env.AWS_SESSION_TOKEN as string;
		const region = process.env.AWS_REGION as string;

		const auth = new SignatureV4({
			credentials: {
				accessKeyId: accessKeyId,
				secretAccessKey: secretAccessKey,
				sessionToken: sessionToken,
			},
			region: region,
			service: "lambda",
			sha256: Sha256,
		});

		// Sign the request
		const signed = await auth.sign({
			method: "POST",
			hostname: apiUrl.host,
			path: apiUrl.pathname,
			protocol: apiUrl.protocol,
			headers: {
				"Content-Type": "application/json",
				host: apiUrl.hostname,
			},
			body: JSON.stringify(props),
		});

		const response = await global.fetch(apiUrl.toString(), {
			method: "POST",
			headers: {
				...signed.headers,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(props),
		});

		return response;
	}
}

export const initializeUserService = new InitializeUserService();
