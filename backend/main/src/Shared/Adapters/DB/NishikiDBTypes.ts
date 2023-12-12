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
	containers?: string[];
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
 */
export type UserGroupRelation = {
	userId: string;
	PK: string;
	SK: string;
}