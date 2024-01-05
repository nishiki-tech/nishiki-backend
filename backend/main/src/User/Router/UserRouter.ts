import { Hono } from "hono";
import {
	honoNotImplementedAdapter,
	honoResponseAdapter,
} from "src/Shared/Adapters/HonoAdapter";
import { UserRepository } from "src/User/Repositories/UserRepository";
import { UpdateUserNameUseCase } from "src/User/UseCases/UpdateUserUseCase/UpdateUserNameUseCase";
import { UpdateUserNameController } from "src/User/Controllers/UpdateUserNameUseCaseController";
import { getUserService } from "src/Services/GetUserIdService/GetUserService";

const userRepository = new UserRepository();

/**
 * This is a User router.
 * https://genesis-tech-tribe.github.io/nishiki-documents/web-api/index.html#tag/user
 * @param app
 */
export const userRouter = (app: Hono) => {
	app.post("/users", async (c) => {
		return honoNotImplementedAdapter(c);
	});
	app.get("/users/:id", async (c) => {
		return honoNotImplementedAdapter(c);
	});
	app.put("/users/:id", async (c) => {
		// TODO: must be updated after the implementation of this service.
		const requestingUserId = await getUserService.getUserId("credential"); // get form credential (header)
		const targetUserId = c.req.param("id"); // get from path param
		const body = await c.req.json();
		const name = body.name;
		const useCase = new UpdateUserNameUseCase(userRepository);
		const controller = new UpdateUserNameController(useCase);
		const result = await controller.execute({
			name,
			targetUserId,
			userId: requestingUserId,
		});
		return honoResponseAdapter(c, result);
	});
};

/**
 * This is an Auth router.
 * https://genesis-tech-tribe.github.io/nishiki-documents/web-api/index.html#tag/auth
 * @param app
 */
export const authRouter = (app: Hono) => {
	app.get("/auth/me", async (c) => {
		return honoNotImplementedAdapter(c);
	});
};
