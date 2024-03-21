import {
	BadRequestStatus,
	Controller,
	InternalServerErrorStatus,
} from "src/Shared";
import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { FindGroupsInformationQuery } from "src/Group/Query/FindGroupsInformation/FindGroupsInformatoinQuery";
import { UserId } from "src/User";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { IUserRepository } from "src/User/Domain/IUserRepository";
import {
	AdminDeleteUserCommand,
	AdminDeleteUserCommandInput,
	CognitoIdentityProviderClient,
	ListUsersCommand,
	ListUsersCommandInput,
	UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { COGNITO_USER_POOL_ID } from "src/Settings/Setting";
import { Err, Ok, Result } from "result-ts-type";

interface IDeleteUserProps {
	/** from the token */
	userId: string;
	/** requested by the user */
	targetUserId: string;
}

/**
 * Delete a user.
 * The groups and containers are deleted when they are possessed by only this user.
 * This service also deletes the user from the Cognito User Pool.
 */
export class DeleteUserService extends Controller<IDeleteUserProps> {
	constructor(
		readonly groupRepository: IGroupRepository,
		readonly userRepository: IUserRepository,
		readonly groupQuery: FindGroupsInformationQuery,
	) {
		super();
	}

	async handler(input: IDeleteUserProps) {
		// check the requested user ID is the same as the user ID from the auth token.
		if (input.userId !== input.targetUserId) {
			return this.forbidden("You cannot delete another user");
		}

		// check user ID
		const targetUserIdOrError = UserId.create(input.targetUserId);
		if (targetUserIdOrError.err) {
			return this.badRequest(targetUserIdOrError.error);
		}

		const targetUserId = targetUserIdOrError.value;

		// check if the user exist
		const targetUser = await this.userRepository.find(targetUserId);

		if (!targetUser) {
			return this.badRequest("The user does not exist.");
		}

		const [removeUserFromNishikiResult, _] = await Promise.all([
			this.removeUserFromNishiki(targetUserId),
			this.removeUserFromCognitoUserPool(targetUser.emailAddress.emailAddress),
		]);

		if (removeUserFromNishikiResult.err) {
			return removeUserFromNishikiResult.error;
		}

		return this.noContent();
	}

	/**
	 * remove the requested user from Cognito
	 * @private
	 */
	private async removeUserFromNishiki(
		userId: UserId,
	): Promise<Result<undefined, BadRequestStatus | InternalServerErrorStatus>> {
		// check if the user is the owner of the group
		const usersGroupsOrError = await this.groupQuery.execute({
			userId: userId.id,
		});
		if (usersGroupsOrError.err) {
			return Err(this.badRequest(usersGroupsOrError.error));
		}

		const usersGroups = usersGroupsOrError.value;

		const groupIds: GroupId[] = [];

		for (const group of usersGroups.groups) {
			const id = GroupId.create(group.groupId);
			if (id.err) {
				return Err(this.internalServerError("Incorrect user id is stored."));
			}
			groupIds.push(id.value);
		}

		const findGroupResult = await Promise.all(
			groupIds.map((groupId) => this.groupRepository.find(groupId)),
		);

		// filter to retrieve groups that have only one user.
		const removingGroups = findGroupResult.filter(
			(group) => group && group.numberOfUsers <= 1,
		) as Group[];

		await Promise.all([
			...removingGroups.map((group) => this.groupRepository.delete(group.id)),
			this.userRepository.delete(userId),
		]);

		return Ok(undefined);
	}

	/**
	 * remove the requested user from Cognito
	 * @param emailAddress
	 * @private
	 */
	private async removeUserFromCognitoUserPool(emailAddress: string) {
		const users = await listUsersFromUserPool(emailAddress);

		if (!users) return;

		await Promise.all(
			(users.filter((user) => user.Username) as UserType[]) // remove undefined
				.map((username) => removeUserFromUserPool(username.Username!)),
		);
	}
}

/**
 * search the Cognito User Pool and remove the target user from it.
 * @param emailAddress
 */
const listUsersFromUserPool = async (emailAddress: string) => {
	const client = new CognitoIdentityProviderClient();

	const input: ListUsersCommandInput = {
		UserPoolId: COGNITO_USER_POOL_ID,
		Filter: `email = "${emailAddress}"`,
	};
	const command = new ListUsersCommand(input);

	const result = await client.send(command);

	return result.Users;
};

const removeUserFromUserPool = async (username: string) => {
	const client = new CognitoIdentityProviderClient();

	const input: AdminDeleteUserCommandInput = {
		UserPoolId: COGNITO_USER_POOL_ID,
		Username: username,
	};

	const command = new AdminDeleteUserCommand(input);

	await client.send(command);
};
