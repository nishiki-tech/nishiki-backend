import { Hono } from "hono";
import { honoResponseAdapter } from "src/Shared/Adapters/HonoAdapter";
import { MockContainerRepository } from "test/Group/MockContainerRepository";
import { CreateContainerUseCase } from "../UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { CreateContainerController } from "../Controllers/CreateContainerController";
import { MockGroupRepository } from "test/Group/MockGroupRepository";

export const containerRouter = (app: Hono) => {
	app.post("/containers/", async (c) => {
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
};
