import { Hono } from "hono";
import {
	honoMethodNotFoundAdapter,
	honoNotImplementedAdapter,
	honoResponseAdapter
} from "src/Shared/Adapters/HonoAdapter";
import {NishikiDynamoDBClient} from "src/Shared/Adapters/DB/NishikiTableClient";
import {GroupRepository} from "src/Group/Repositories/GroupRepository";
import {
	GenerateInvitationLinkHash,
	InvitationHashService
} from "src/Services/InvitationHashService/InvitationHashService";
import {getUserService} from "src/Services/GetUserIdService/GetUserService";

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

	app.get("/groups/:groupId", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.put("/groups/:groupId", async (c) => {
		const groupId = c.req.param("groupId");
		const { Action } = c.req.query();

		const userId = await getUserService.getUserId("credential"); // get form credential (header)

		// when generate a new invitation link hash for the group.
		if (Action === "generateInvitationLink") {
			const service = new GenerateInvitationLinkHash(nishikiDynamoDBClient, groupRepository);
			const result = await service.execute({
				groupId, userId
			})
			return honoResponseAdapter(c, result);
		}

		return honoMethodNotFoundAdapter(c);
	})

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
