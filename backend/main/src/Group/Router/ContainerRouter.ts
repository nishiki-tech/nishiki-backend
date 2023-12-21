import { Hono } from "hono";
import { honoResponseAdapter } from "src/Shared/Adapters/HonoAdapter";
import { MockContainerRepository } from "test/Group/MockContainerRepository";
import { CreateContainerUseCase } from "../UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { CreateContainerController } from "../Controllers/CreateContainerController";
import { MockGroupRepository } from "test/Group/MockGroupRepository";
import { honoNotImplementedAdapter } from "src/Shared/Adapters/HonoAdapter";

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
		const userId = '"aaaaaaaa-1111-1111-1111-111111111111"';
		const mockContainerRepository = new MockContainerRepository();
		const mockGroupRepository = new MockGroupRepository();
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
		return honoNotImplementedAdapter(c);
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
