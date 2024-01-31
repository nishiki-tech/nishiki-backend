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
import { Err, Ok, Result } from "result-ts-type";
import { IFoodDto } from "src/Group/Dtos/FoodDto";
import { AddFoodToContainerUseCase } from "src/Group/UseCases/AddFoodToContainerUseCase/AddFoodToContainerUseCase";
import { AddFoodToContainerController } from "src/Group/Controllers/AddFoodToContainerController";
import { DeleteContainerUseCase } from "src/Group/UseCases/DeleteContainerUseCase/DeleteContainerUseCase";
import { DeleteContainerController } from "src/Group/Controllers/DeleteContainerController";
import { UpdateFoodOfContainerUseCase } from "src/Group/UseCases/UpdateFoodOfContainerUseCase/UpdateFoodOfContainerUseCase";
import { UpdateFoodOfContainerController } from "src/Group/Controllers/UpdateFoodOfContainerController";
import { DeleteFoodFromContainerUseCase } from "src/Group/UseCases/DeleteFoodFromContainerUseCase/DeleteFoodFromContainerUseCase";
import { DeleteFoodFromContainerController } from "src/Group/Controllers/DeleteFoodFromContainerController";

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
		const containerId = c.req.param("containerId");

		const [userIdOrError, body] = await Promise.all([
			getUserIdService.getUserId(authHeader(c)),
			c.req.json(),
		]);

		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}

		const input = isCorrectFoodBody(body);

		if (input.err) {
			return honoBadRequestAdapter(c, input.error);
		}

		const userId = userIdOrError.value;

		const useCase = new AddFoodToContainerUseCase(
			containerRepository,
			groupRepository,
		);
		const controller = new AddFoodToContainerController(useCase);

		const result = await controller.execute({
			userId,
			containerId,
			...input.value,
		});

		return honoResponseAdapter(c, result);
	});

	app.put("/containers/:containerId/foods/:foodId", async (c) => {
		const [userIdOrError, body] = await Promise.all([
			getUserIdService.getUserId(authHeader(c)),
			c.req.json(),
		]);

		const containerId = c.req.param("containerId");
		const foodId = c.req.param("foodId");

		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}

		const input = isCorrectFoodBody(body);

		if (input.err) {
			return honoBadRequestAdapter(c, input.error);
		}

		const useCase = new UpdateFoodOfContainerUseCase(
			containerRepository,
			groupRepository,
		);
		const controller = new UpdateFoodOfContainerController(useCase);
		const result = await controller.execute({
			...input.value,
			userId: userIdOrError.value,
			containerId,
			foodId,
		});
		return honoResponseAdapter(c, result);
	});

	app.delete("/containers/:containerId/foods/:foodId", async (c) => {
		const containerId = c.req.param("containerId");
		const foodId = c.req.param("foodId");
		const userIdOrError = await getUserIdService.getUserId(authHeader(c));

		if (userIdOrError.err) {
			return honoBadRequestAdapter(c, userIdOrError.error.message);
		}

		const userId = userIdOrError.value;

		const useCase = new DeleteFoodFromContainerUseCase(
			containerRepository,
			groupRepository,
		);
		const controller = new DeleteFoodFromContainerController(useCase);

		const result = await controller.execute({
			userId,
			foodId,
			containerId,
		});

		return honoResponseAdapter(c, result);
	});
};

/**
 * Check the food input since checking input value is very complex.
 * https://genesis-tech-tribe.github.io/nishiki-documents/web-api/index.html#tag/container/paths/~1containers~1%7BcontainerId%7D~1foods/post
 * @param body
 */
// biome-ignore lint/suspicious/noExplicitAny: this any cannot avoid
const isCorrectFoodBody = (body: any): Result<IFoodDto, string> => {
	if (!body) return Err("Body cannot be null");
	if (!body.name) return Err("Enter the food name");
	if (!(body.unit || body.unit === null)) return Err("Incorrect unit value");
	if (!body.category) return Err("Category must be selected");
	if (!(body.quantity || body.quantity === null))
		return Err("Incorrect unit value");
	if (!(body.expiry || body.expiry === null))
		return Err("Incorrect expiry value");
	if (!(body.unit && typeof body.unit === "string"))
		return Err("Unit must be number");
	if (!(body.quantity && typeof body.quantity === "number"))
		return Err("Quantity must be number");
	if (!(body.expiry && typeof body.expiry === "string"))
		return Err("Expiry must be number");

	return Ok({
		name: body.name,
		unit: body.unit,
		quantity: body.quantity,
		expiry: body.expiry ? new Date(body.expiry) : undefined,
		category: body.category,
	});
};
