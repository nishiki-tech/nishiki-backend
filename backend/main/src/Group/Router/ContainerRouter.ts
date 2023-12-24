import { Hono } from "hono";
import { honoResponseAdapter } from "src/Shared/Adapters/HonoAdapter";
import { MockContainerRepository } from "test/Group/MockContainerRepository";
import { CreateContainerUseCase } from "../UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { CreateContainerController } from "../Controllers/CreateContainerController";
import { MockGroupRepository } from "test/Group/MockGroupRepository";
import { honoNotImplementedAdapter } from "src/Shared/Adapters/HonoAdapter";
import { FindContainerController } from "../Controllers/FindContainerController";
import { getUserService } from "src/Services/GetUserIdService/GetUserService";
import { FindContainerQuery } from "src/Group/Query/FindContainer/FindContanerQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";

const mockContainerRepository = new MockContainerRepository();
const mockGroupRepository = new MockGroupRepository();

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
		// TODO: get userId from auth header
		const userId = await getUserService.getUserId("credential");
		const useCase = new CreateContainerUseCase(
			mockContainerRepository,
			mockGroupRepository,
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
		// TODO: get userId from auth header
		const userId = await getUserService.getUserId("credential");
		const query = new FindContainerQuery(new NishikiDynamoDBClient());
		const controller = new FindContainerController(query);
		const result = await controller.execute({
			userId,
			containerId,
		});
		return honoResponseAdapter(c, result);
	});

	app.put("/containers/:containerId", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.delete("/containers/:containerId", async (c) => {
		return honoNotImplementedAdapter(c);
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
