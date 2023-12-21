import { userData } from "./User";
import { CONTAINER_ID1, CONTAINER_ID2 } from "./Container";

export const groupData = {
	groupData: [
		{
			groupId: "b53f3d40-163a-4d0e-973e-0dc083dcdd23",
			groupName: "Group 1",
			users: userData.userInput.map((el) => el.userId),
			containerIds: [CONTAINER_ID1, CONTAINER_ID2],
		},
		{
			groupId: "a1520c90-3dff-479b-860f-41ac43ba6dee",
			groupName: "No Containers",
			users: userData.userInput.map((el) => el.userId),
		},
		{
			groupId: "668e79a7-aa38-428a-8efe-f115f90acb14",
			groupName: "No Users",
			containerIds: [CONTAINER_ID1, CONTAINER_ID2],
		},
		{
			groupId: "059ef791-89bf-4c65-bda9-b6546b8a62a8",
			groupName: "Group Only",
		},
	],
};
