/**
 * The user data model in the DB.
 */
export type UserData = {
	userId: string;
	username: string;
	emailAddress: string;
};

/**
 * The group data model in the DB.
 */
export type GroupData = {
	groupId: string;
	groupName: string;
};
