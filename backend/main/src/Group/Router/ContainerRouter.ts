import { Hono } from "hono";
import { honoResponseAdapter } from "src/Shared/Adapters/HonoAdapter";
import { CreateContainerUseCase } from "../UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { CreateContainerController } from "../Controllers/CreateContainerController";
import {
	honoNotImplementedAdapter,
	honoBadRequestAdapter,
	authHeader,
} from "src/Shared/Adapters/HonoAdapter";
import { FindContainerController } from "../Controllers/FindContainerController";
import { GetUserService } from "src/Services/GetUserIdService/GetUserService";
import { FindContainerQuery } from "src/Group/Query/FindContainer/FindContanerQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { UpdateContainerNameController } from "src/Group/Controllers/UpdateContainerNameController";
import { UpdateContainerNameUseCase } from "src/Group/UseCases/UpdateContainerNameUseCase/UpdateContainerNameUseCase";
import { GroupRepository } from "src/Group/Repositories/GroupRepository";
import { ContainerRepository } from "src/Group/Repositories/ContainerRepository";
import { DeleteContainerUseCase } from "src/Group/UseCases/DeleteContainerUseCase/DeleteContainerUseCase";
import { DeleteContainerController } from "src/Group/Controllers/DeleteContainerController";

const nishikiDynamoDBClient = new NishikiDynamoDBClient();
const containerRepository = new ContainerRepository();
const groupRepository = new GroupRepository();
const getUserIdService = new GetUserService(nishikiDynamoDBClient);

/**
 * This is a Container router.
 * https://genesis-tech-tribe.github.io/nishiki-documents/web-api/index.html#tag/container
 * @param app
 */
export const containerRouter = (app: Hono) => {
	app.get("/containers", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.post("/containers", async (c) => {
		const body = await c.req.json();
		const groupId = body.groupId;
		const name = body.name;
		const userIdOrError = await getUserIdService.getUserId(authHeader(c));
		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}
		const userId = userIdOrError.value;
		const useCase = new CreateContainerUseCase(
			containerRepository,
			groupRepository,
		);
		const controller = new CreateContainerController(useCase);
		const result = await controller.execute({
			userId,
			name,
			groupId,
		});
		return honoResponseAdapter(c, result);
	});

	app.get("/containers/:containerId", async (c) => {
		const containerId = c.req.param("containerId");
		const userIdOrError = await getUserIdService.getUserId(authHeader(c));
		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}
		const userId = userIdOrError.value;
		const query = new FindContainerQuery(nishikiDynamoDBClient);
		const controller = new FindContainerController(query);
		const result = await controller.execute({
			userId,
			containerId,
		});
		return honoResponseAdapter(c, result);
	});

	app.put("/containers/:containerId", async (c) => {
		const [userIdOrError, body] = await Promise.all([
			getUserIdService.getUserId(authHeader(c)),
			c.req.json(),
		]);
		const containerId = c.req.param("containerId");
		const containerName = body.containerName;
		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}
		const userId = userIdOrError.value;

		if (!containerName) {
			return honoBadRequestAdapter(
				c,
				"The container name is needed in the request body.",
			);
		}

		const useCase = new UpdateContainerNameUseCase(
			containerRepository,
			groupRepository,
		);
		const controller = new UpdateContainerNameController(useCase);

		const result = await controller.execute({
			userId,
			containerId,
			name: containerName,
		});

		return honoResponseAdapter(c, result);
	});

	app.delete("/containers/:containerId", async (c) => {
		const userIdOrError = await getUserIdService.getUserId(authHeader(c));
		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}
		const userId = userIdOrError.value;
		const containerId = c.req.param("containerId");

		const useCase = new DeleteContainerUseCase(
			containerRepository,
			groupRepository,
		);
		const controller = new DeleteContainerController(useCase);

		const result = await controller.execute({
			userId,
			containerId,
		});

		return honoResponseAdapter(c, result);
	});

	app.post("/containers/:containerId/foods", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.put("/containers/:containerId/foods/:foodId", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.delete("/containers/:containerId/foods/:foodId", async (c) => {
		return honoNotImplementedAdapter(c);
	});
};
