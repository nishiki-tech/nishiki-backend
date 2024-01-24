import { Err, Ok, Result } from "result-ts-type";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { ServiceError } from "src/Shared/Utils/Errors";
import jwt from "jsonwebtoken";

export interface IGetUserService {
	getUserId(authHeader?: string): Promise<Result<string, ServiceError>>;
}

export class GetUserService implements IGetUserService {
	constructor(private readonly nishikiDynamoDBClient: NishikiDynamoDBClient) {
		this.nishikiDynamoDBClient = nishikiDynamoDBClient;
	}
	async getUserId(authHeader?: string): Promise<Result<string, ServiceError>> {
		if (!authHeader) {
			return Err(new InvalidTokenError("The token is not found."));
		}
		// get token from bearer token
		const authToken = authHeader.split(" ")[1];
		const decodedToken = jwt.decode(authToken);
		if (!decodedToken)
			return Err(new InvalidTokenError("The token is invalid."));

		const emailAddress = decodedToken.sub;
		if (typeof emailAddress !== "string")
			return Err(new InvalidTokenError("The token is invalid."));

		const userId =
			await this.nishikiDynamoDBClient.getUserIdByEmail(emailAddress);

		if (!userId) {
			return Err(new InvalidTokenError("The token is invalid."));
		}

		return Ok(userId);
	}
}

export class InvalidTokenError extends ServiceError {}
