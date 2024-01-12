import { Hono } from "hono";
import {
	honoCreatedResponseAdapter,
	honoNotFoundAdapter,
	honoNotImplementedAdapter,
	honoResponseAdapter,
} from "src/Shared/Adapters/HonoAdapter";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { GroupRepository } from "src/Group/Repositories/GroupRepository";
import {
	GenerateInvitationLinkHash,
	JoinGroupByInvitationLinkHash,
} from "src/Services/InvitationHashService/InvitationHashService";
import { getUserService } from "src/Services/GetUserIdService/GetUserService";
import { FindAGroupInformation } from "src/Group/Query/FindAGroupInforamtion/FindAGroupInformation";
import { FindAGroupInformationController } from "src/Group/Controllers/FindAGroupInforamtionController";

const nishikiDynamoDBClient = new NishikiDynamoDBClient();
const groupRepository = new GroupRepository(nishikiDynamoDBClient);

/**
 * This is a Group router.
 * https://genesis-tech-tribe.github.io/nishiki-documents/web-api/index.html#tag/group
 * @param app
 */
export const groupRouter = (app: Hono) => {
	app.get("/groups", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.post("/groups", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.put("/groups", async (c) => {
		const [join, userId] = await Promise.all([
			c.req.json(),
			getUserService.getUserId("credential"), // get form credential (header)
		]);
		const action = c.req.query("Action");
		const hash = join.invitationLinkHash;

		if (action === "joinToGroup" && hash) {
			const service = new JoinGroupByInvitationLinkHash(
				nishikiDynamoDBClient,
				groupRepository,
			);

			const result = await service.execute({ hash, userId });

			return honoResponseAdapter(c, result);
		}
		return honoNotFoundAdapter(c);
	});

	app.get("/groups/:groupId", async (c) => {
		const groupId = c.req.param("groupId");

		const query = new FindAGroupInformation(nishikiDynamoDBClient);
		const controller = new FindAGroupInformationController(query);
		const result = await controller.execute({ groupId });

		return honoResponseAdapter(c, result);
	});

	app.put("/groups/:groupId", async (c) => {
		const groupId = c.req.param("groupId");
		const action = c.req.query("Action");

		const userId = await getUserService.getUserId("credential"); // get form credential (header)

		// when generate a new invitation link hash for the group.
		if (action === "generateInvitationLink") {
			const service = new GenerateInvitationLinkHash(
				nishikiDynamoDBClient,
				groupRepository,
			);
			const result = await service.execute({
				groupId,
				userId,
			});

			// remove an expiry datetime
			if (result.status === "CREATED" && result.body) {
				return honoCreatedResponseAdapter(c, {
					invitationLinkHash: result.body.hash,
				});
			}

			return honoResponseAdapter(c, result);
		}

		return honoNotFoundAdapter(c);
	});

	app.get("/groups/:groupId/containers", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.get("/groups/:groupId/users", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.put("/groups/:groupId/users/:userId", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.delete("/groups/:groupId/users/:userId", async (c) => {
		return honoNotImplementedAdapter(c);
	});
};
