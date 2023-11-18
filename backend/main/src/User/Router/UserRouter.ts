import { Hono } from "hono";
import { CreateUserController } from "src/User/Controllers/CreateUserController";
import { CreateUserUseCase } from "src/User/UseCases/CreateUserUseCase/CreateUserUseCase";
import { MockUserRepository } from "test/User/MockUserRepository";
import {
	honoNotImplementedAdapter,
	honoResponseAdapter,
} from "src/Shared/Adapters/HonoAdapter";

export const userRouter = (app: Hono) => {
	app.get("/users/:id", (c) => {
		return honoNotImplementedAdapter(c);
	});
	app.put("/users/:id", async (c) => {
		const id = c.req.param("id");
		const body = await c.req.json();
		const name = body.name;
		const emailAddress = body.emailAddress;
		const mockUserRepository = new MockUserRepository();
		const useCase = new CreateUserUseCase(mockUserRepository);
		const controller = new CreateUserController(useCase);
		const result = await controller.execute({
			name,
			emailAddress,
		});
		return honoResponseAdapter(c, result);
	});
	app.delete("/users/:id", (c) => {
		return honoNotImplementedAdapter(c);
	});
};
