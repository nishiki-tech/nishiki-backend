/**
 * The user data model in the DB.
 */
export type UserData = {
	userId: string;
	username: string;
	emailAddress: string;
};

/**
 * Save group's props
 */
export type GroupInput = {
	groupName?: string;
	userIds?: string[];
	containerIds?: string[];
};

/**
 * The group data model in the DB.
 */
export type GroupData = {
	groupId: string;
	groupName: string;
};

/**
 * User and group relations GSI
 * The UserId is also the partition key.
 */
export type UserGroupRelation = {
	userId: string;
	SK: string;
};
