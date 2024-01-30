import { Hono } from "hono";
import {
	honoCreatedResponseAdapter,
	honoNotFoundAdapter,
	honoNotImplementedAdapter,
	honoResponseAdapter,
	honoBadRequestAdapter,
	authHeader,
} from "src/Shared/Adapters/HonoAdapter";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { GroupRepository } from "src/Group/Repositories/GroupRepository";
import {
	GenerateInvitationLinkHash,
	JoinGroupByInvitationLinkHash,
} from "src/Services/InvitationHashService/InvitationHashService";
import { GetUserService } from "src/Services/GetUserIdService/GetUserService";
import { FindAGroupInformationQuery } from "src/Group/Query/FindAGroupInforamtion/FindAGroupInformationQuery";
import { FindAGroupInformationController } from "src/Group/Controllers/FindAGroupInforamtionController";
import { FindGroupsInformationQuery } from "src/Group/Query/FindGroupsInformation/FindGroupsInformatoinQuery";
import { FindGroupsInformationController } from "src/Group/Controllers/FindGroupsInformationController";
import { FindUsersBelongToAGroupController } from "src/Group/Controllers/FindUsersBelongToAGroupController";
import { FindUsersBelongingToAGroupQuery } from "src/Group/Query/FindUsersBelongingToAGroupQuery/FindUsersBelongingToAGroupQuery";
import { FindContainersInAGroupController } from "src/Group/Controllers/FindContainersInAGroupController";
import { FindContainersInAGroupQuery } from "src/Group/Query/FindContainersInAGroupQuery/FindContainersInAGroupQuery";
import { DeleteUserFromGroupUseCase } from "src/Group/UseCases/DeleteUserFromGroupUseCase/DeleteUserFromGroupUseCase";
import { DeleteUserFromGroupController } from "src/Group/Controllers/DeleteUserFromGroupController";
import { CreateGroupUseCase } from "../UseCases/CreateGroupUseCase/CreateGroupUseCase";
import { CreateGroupController } from "../Controllers/CreateGroupController";

const nishikiDynamoDBClient = new NishikiDynamoDBClient();
const groupRepository = new GroupRepository(nishikiDynamoDBClient);
const getUserIdService = new GetUserService(nishikiDynamoDBClient);

/**
 * This is a Group router.
 * https://genesis-tech-tribe.github.io/nishiki-documents/web-api/index.html#tag/group
 * @param app
 */
export const groupRouter = (app: Hono) => {
	app.get("/groups", async (c) => {
		const userIdOrError = await getUserIdService.getUserId(authHeader(c));
		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}
		const userId = userIdOrError.value;

		const query = new FindGroupsInformationQuery(nishikiDynamoDBClient);
		const controller = new FindGroupsInformationController(query);

		const result = await controller.execute({ userId });

		return honoResponseAdapter(c, result);
	});

	app.post("/groups", async (c) => {
		const { groupName } = await c.req.json();
		const userIdOrError = await getUserIdService.getUserId(authHeader(c));
		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}
		const userId = userIdOrError.value;

		const useCase = new CreateGroupUseCase(groupRepository);
		const controller = new CreateGroupController(useCase);
		const result = await controller.execute({ userId, name:groupName });

		return honoResponseAdapter(c, result);
	});

	app.put("/groups", async (c) => {
		const [join, userIdOrError] = await Promise.all([
			c.req.json(),
			getUserIdService.getUserId(authHeader(c)),
		]);
		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}
		const userId = userIdOrError.value;
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

		const query = new FindAGroupInformationQuery(nishikiDynamoDBClient);
		const controller = new FindAGroupInformationController(query);
		const result = await controller.execute({ groupId });

		return honoResponseAdapter(c, result);
	});

	app.put("/groups/:groupId", async (c) => {
		const groupId = c.req.param("groupId");
		const action = c.req.query("Action");

		const userIdOrError = await getUserIdService.getUserId(authHeader(c));
		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}
		const userId = userIdOrError.value;

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
		const groupId = c.req.param("groupId");
		const query = new FindContainersInAGroupController(
			new FindContainersInAGroupQuery(nishikiDynamoDBClient),
		);
		const result = await query.execute({ groupId });
		return honoResponseAdapter(c, result);
	});

	app.get("/groups/:groupId/users", async (c) => {
		const groupId = c.req.param("groupId");
		const query = new FindUsersBelongingToAGroupQuery(nishikiDynamoDBClient);
		const controller = new FindUsersBelongToAGroupController(query);
		const result = await controller.execute({ groupId });
		return honoResponseAdapter(c, result);
	});

	app.put("/groups/:groupId/users/:userId", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.delete("/groups/:groupId/users/:userId", async (c) => {
		const groupId = c.req.param("groupId");
		const targetUserId = c.req.param("userId");
		const userIdOrError = await getUserIdService.getUserId(authHeader(c));
		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}
		const userId = userIdOrError.value;

		const useCase = new DeleteUserFromGroupUseCase(groupRepository);
		const controller = new DeleteUserFromGroupController(useCase);
		const result = await controller.execute({ groupId, userId, targetUserId });
		return honoResponseAdapter(c, result);
	});
};
