export interface IInitializeUserProps {
	name: string;
	emailAddress: string;
}

export interface IInitializeUserService {
	execute(props: IInitializeUserProps): Promise<Response>;
}
const LAMBDA_FUNCTION_URL = process.env.LAMBDA_FUNCTION_URL as string;

// TODO: must be implemented
export class InitializeUserService implements IInitializeUserService {
	execute(props: IInitializeUserProps): Promise<Response> {
		return fetch(`${LAMBDA_FUNCTION_URL}users`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(props),
		});
	}
}

export const initializeUserService = new InitializeUserService();
