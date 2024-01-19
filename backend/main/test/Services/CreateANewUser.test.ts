import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { testDynamoDBClient } from "test/Shared/Adapters/DynamoDBTestClient";
import { CreateANewUserService } from "src/Services/CreateNewUserService/CreateANewUserService";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { CreateUserUseCase } from "src/User/UseCases/CreateUserUseCase/CreateUserUseCase";
import { CreateGroupUseCase } from "src/Group/UseCases/CreateGroupUseCase/CreateGroupUseCase";
import { CreateContainerUseCase } from "src/Group/UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { MockContainerRepository } from "test/Group/MockContainerRepository";
import { MockGroupRepository } from "test/Group/MockGroupRepository";
import { MockUserRepository } from "test/User/MockUserRepository";
import { UseCaseError } from "src/Shared";
import { IUserDto } from "src/User/Dtos/UserDto";
import { IGroupDto } from "src/Group/Dtos/GroupDto";
import { IContainerDto } from "src/Group/Dtos/ContainerDto";
import { Err, Ok, Result } from "result-ts-type";

describe("Create a new user service", () => {
	const TABLE_NAME = "create-a-new-user-service";
	const testNishikiDynamoDBClient = testDynamoDBClient(TABLE_NAME);
	const mockContainerRepository = new MockContainerRepository();
	const mockGroupRepository = new MockGroupRepository();
	const mockUserRepository = new MockUserRepository();

	let createUserUseCase: CreateUserUseCase;
	let createGroupUseCase: CreateGroupUseCase;
	let createContainerUseCase: CreateContainerUseCase;
	let nishikiDynamoDBClient: NishikiDynamoDBClient;

	let service: CreateANewUserService;

	beforeEach(() => {
		nishikiDynamoDBClient = new NishikiDynamoDBClient(
			testNishikiDynamoDBClient,
			TABLE_NAME,
		);
		createUserUseCase = new CreateUserUseCase(mockUserRepository);
		createGroupUseCase = new CreateGroupUseCase(mockGroupRepository);
		createContainerUseCase = new CreateContainerUseCase(
			mockContainerRepository,
			mockGroupRepository,
		);
		service = new CreateANewUserService(
			createUserUseCase,
			createGroupUseCase,
			createContainerUseCase,
			mockGroupRepository,
			nishikiDynamoDBClient,
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Normal System", () => {
		it("created a new user", async () => {
			vi.spyOn(nishikiDynamoDBClient, "getUserIdByEmail").mockImplementation(() => {
				return Promise.resolve(null)
			});
			vi.spyOn(createUserUseCase, "execute").mockImplementation(() => {
				return createdUserUseCaseResponse;
			});
			vi.spyOn(createGroupUseCase, "execute").mockImplementation(() => {
				return createdGroupUseCaseResponse;
			});
			vi.spyOn(createContainerUseCase, "execute").mockImplementation(() => {
				return createdContainerUseCaseResponse;
			});

			const result = await service.execute(dummyInput);

			expect(result.status).toBe("CREATED");
			expect(result.statusCode).toBe(201);
		});
	});

	describe("Abnormal System", () => {
		it("Creating a user failed", async () => {
			vi.spyOn(nishikiDynamoDBClient, "getUserIdByEmail").mockImplementation(() => {
				return Promise.resolve(null)
			});
			vi.spyOn(createUserUseCase, "execute").mockImplementationOnce(() => {
				return errorResult;
			});

			const result = await service.execute(dummyInput);

			expect(result.statusCode).toBe(400);
			expect(result.status).toBe("BAD_REQUEST");
		});

		it("When creating a group fails, then the user data is deleted", async () => {
			vi.spyOn(nishikiDynamoDBClient, "getUserIdByEmail").mockImplementation(() => {
				return Promise.resolve(null)
			});
			vi.spyOn(createUserUseCase, "execute").mockImplementationOnce(() => {
				return createdUserUseCaseResponse;
			});
			vi.spyOn(createGroupUseCase, "execute").mockImplementationOnce(() => {
				return errorResult;
			});
			vi.spyOn(nishikiDynamoDBClient, "deleteUser").mockImplementationOnce(
				() => {
					return Promise.resolve();
				},
			);

			const result = await service.execute(dummyInput);

			expect(result.statusCode).toBe(400);
			expect(result.status).toBe("BAD_REQUEST");
			expect(nishikiDynamoDBClient.deleteUser).toBeCalled();
		});

		it("When creating a container fails, then the user data and the group data are deleted", async () => {
			vi.spyOn(nishikiDynamoDBClient, "getUserIdByEmail").mockImplementation(() => {
				return Promise.resolve(null)
			});
			vi.spyOn(createUserUseCase, "execute").mockImplementationOnce(() => {
				return createdUserUseCaseResponse;
			});
			vi.spyOn(createGroupUseCase, "execute").mockImplementationOnce(() => {
				return createdGroupUseCaseResponse;
			});
			vi.spyOn(nishikiDynamoDBClient, "deleteUser").mockImplementationOnce(
				() => {
					return Promise.resolve();
				},
			);
			vi.spyOn(mockGroupRepository, "delete").mockImplementationOnce(() => {
				return Promise.resolve(undefined);
			});

			const result = await service.execute(dummyInput);

			expect(result.statusCode).toBe(400);
			expect(result.status).toBe("BAD_REQUEST");
			expect(nishikiDynamoDBClient.deleteUser).toBeCalled();
			expect(mockGroupRepository.delete).toBeCalled();
		});
		it("The requested email address is already registered", async () => {
			vi.spyOn(nishikiDynamoDBClient, "getUserIdByEmail").mockImplementation(() => {
				return Promise.resolve(dummyInput.emailAddress)
			});

			const result = await service.execute(dummyInput);

			expect(result.statusCode).toBe(400);
			expect(result.status).toBe("BAD_REQUEST");
		})
	});
});

// biome-ignore lint/suspicious/noExplicitAny: this is the test code
const createdUserUseCaseResponse: Promise<Result<IUserDto, any>> =
	Promise.resolve(
		Ok({
			id: "bb8a8d16-19c3-42d9-9db1-451a9473cad1",
			name: "user",
		}),
	);

// biome-ignore lint/suspicious/noExplicitAny: this is the test code
const createdGroupUseCaseResponse: Promise<Result<IGroupDto, any>> =
	Promise.resolve(
		Ok({
			id: "4e9b3656-8fec-4f64-a33d-96225a5dbf34",
			name: "user's group",
			containerIds: [],
			userIds: [],
		}),
	);

// biome-ignore lint/suspicious/noExplicitAny: this is the test code
const createdContainerUseCaseResponse: Promise<Result<IContainerDto, any>> =
	Promise.resolve(
		Ok({
			id: "4a27e18a2-e551-4f30-b4f6-74d92362863c",
			name: "user's container",
			foods: [],
		}),
	);

class DummyError extends UseCaseError {}

// biome-ignore lint/suspicious/noExplicitAny: this is the test code
const errorResult: Promise<Result<any, UseCaseError>> = Promise.resolve(
	Err(new DummyError("dummy error")),
);

const dummyInput = { emailAddress: "email@gmail.com" };
