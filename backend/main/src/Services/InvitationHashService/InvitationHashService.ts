import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { Err, Ok, Result } from "result-ts-type";
import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { GroupId } from "src/Group/Domain/Entities/Group";
import { UserId } from "src/User";
import Md5 from "crypto-js/md5";
import { DomainObjectError, ServiceError } from "src/Shared/Utils/Errors";

interface IHash {
	hash: string;
	expiryDatetime: Date;
}

export interface IGenerateAnInvitationHashService {
	generateAnInvitationHash(input: { groupId: string; userId: string }): Promise<
		Result<IHash, DomainObjectError | GroupNotFound | PermissionError>
	>;
}

export interface IJoinToGroupUsingAnInvitationHashService {
	joinToGroupUsingAnInvitationHash(invitationHash: string): Promise<string>;
}

export class InvitationHashService implements IGenerateAnInvitationHashService {
	private nishikiDynamoDBClient: NishikiDynamoDBClient;
	private groupRepository: IGroupRepository;

	constructor(
		nishikiDynamoDBClient: NishikiDynamoDBClient,
		groupRepository: IGroupRepository,
	) {
		this.nishikiDynamoDBClient = nishikiDynamoDBClient;
		this.groupRepository = groupRepository;
	}

	/**
	 * This method generate an invitation hash.
	 * Before generating an invitation hash, this method check existence of the invitation hash.
	 * If the invitation hash does exist, this method checks the expiry datetime.
	 * If the expiry datetime is over, this method generate a new invitation hash.
	 * If not over, this method returns the invitation hash with updating the expiry datetime.
	 * The invitation hash link is generated by a string of "groupId + expiry Datetime" using MD5.
	 * https://genesis-tech-tribe.github.io/nishiki-documents/project-document/specifications/detail/invitation-to-group#invitation-link-specification

	 * @param input
	 */
	async generateAnInvitationHash(input: {
		groupId: string;
		userId: string;
	}): Promise<
		Result<IHash, DomainObjectError | GroupNotFound | PermissionError>
	> {
		const groupIdOrError = GroupId.create(input.groupId);
		const userIdOrError = UserId.create(input.userId);

		if (groupIdOrError.err || userIdOrError.err) {
			if (groupIdOrError.err) {
				return Err(groupIdOrError.error);
			}
			return Err(userIdOrError.unwrapError());
		}

		const { groupId, userId } = {
			groupId: groupIdOrError.value,
			userId: userIdOrError.value,
		};

		const group = await this.groupRepository.find(groupId);

		if (!group) {
			return Err(new GroupNotFound("Group not found"));
		}

		if (!group.canEdit(userId)) {
			return Err(
				new PermissionError("You don't have permission to access this group."),
			);
		}

		const invitationHash = await this.nishikiDynamoDBClient.getInvitationLink(
			groupId.id,
		);

		const now = new Date(Date.now());
		const expiryDatetime = new Date(Date.now());
		expiryDatetime.setHours(expiryDatetime.getHours() + 24); // 24 hours.

		const hash = Md5(`${groupId.id}${expiryDatetime}`).toString();

		// invitation link doesn't exist.
		if (!invitationHash) {
			await this.nishikiDynamoDBClient.addInvitationLink(
				groupId.id,
				expiryDatetime,
				hash,
			);
			return Ok({
				hash,
				expiryDatetime,
			});
		}

		// invitation link doesn't expire.
		if (now < invitationHash.linkExpiryTime) {
			await this.nishikiDynamoDBClient.addInvitationLink(
				groupId.id,
				expiryDatetime,
				invitationHash.invitationLinkHash,
			);
			return Ok({
				hash: invitationHash.invitationLinkHash,
				expiryDatetime,
			});
		}

		// invitation link expires, remove it, and generate a new one.
		await Promise.all([
			this.nishikiDynamoDBClient.addInvitationLink(
				groupId.id,
				expiryDatetime,
				hash,
			),
			this.nishikiDynamoDBClient.deleteInvitationLink(invitationHash),
		]);
		return Ok({
			hash,
			expiryDatetime,
		});
	}
}

export class GroupNotFound extends ServiceError {}
export class PermissionError extends ServiceError {}