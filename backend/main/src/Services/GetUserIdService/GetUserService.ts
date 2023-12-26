export interface IGetUserService {
	getUserId(header: string): Promise<string>;
}

// TODO: must be implemented
export class GetUserService implements IGetUserService {
	getUserId(header: string): Promise<string> {
		return Promise.resolve("user id");
	}
}

export const getUserService = new GetUserService();
