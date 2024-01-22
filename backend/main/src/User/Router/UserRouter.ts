import { Hono } from "hono";
import {
	honoBadRequestAdapter,
	honoNotImplementedAdapter,
	honoOkResponseAdapter,
	honoResponseAdapter,
} from "src/Shared/Adapters/HonoAdapter";
import { UserRepository } from "src/User/Repositories/UserRepository";
import { UpdateUserNameUseCase } from "src/User/UseCases/UpdateUserUseCase/UpdateUserNameUseCase";
import { UpdateUserNameController } from "src/User/Controllers/UpdateUserNameUseCaseController";
import { getUserService } from "src/Services/GetUserIdService/GetUserService";
import { FindUserQuery } from "src/User/Query/FindUser/FindUserQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { FindUserController } from "src/User/Controllers/FindUserController";
import { CreateANewUserService } from "src/Services/CreateNewUserService/CreateANewUserService";
import { CreateGroupUseCase } from "src/Group/UseCases/CreateGroupUseCase/CreateGroupUseCase";
import { CreateUserUseCase } from "src/User/UseCases/CreateUserUseCase/CreateUserUseCase";
import { GroupRepository } from "src/Group/Repositories/GroupRepository";
import { ContainerRepository } from "src/Group/Repositories/ContainerRepository";
import { CreateContainerUseCase } from "src/Group/UseCases/CreateContainerUseCase/CreateContainerUseCase";

const nishikiDynamoDBClient = new NishikiDynamoDBClient();
const userRepository = new UserRepository();
const groupRepository = new GroupRepository();
const containerRepository = new ContainerRepository();

/**
 * This is a User router.
 * https://genesis-tech-tribe.github.io/nishiki-documents/web-api/index.html#tag/user
 * @param app
 */
export const userRouter = (app: Hono) => {
	app.post("/users", async (c) => {
		const body = await c.req.json();

		if (!(body.emailAddress && typeof body.emailAddress === "string")) {
			return honoBadRequestAdapter(c, "E-Mail Address is not provided.");
		}

		const service = new CreateANewUserService(
			new CreateUserUseCase(userRepository),
			new CreateGroupUseCase(groupRepository),
			new CreateContainerUseCase(containerRepository, groupRepository),
			groupRepository,
			nishikiDynamoDBClient,
		);

		const result = await service.execute({
			name: body.name,
			emailAddress: body.emailAddress,
		});

		return honoResponseAdapter(c, result);
	});

	// get user by id.
	app.get("/users/:id", async (c) => {
		const id = c.req.param("id");
		const query = new FindUserQuery(nishikiDynamoDBClient);
		const controller = new FindUserController(query);
		const result = await controller.execute(id);
		return honoOkResponseAdapter(c, result);
	});

	// update user name.
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
