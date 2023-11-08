import { describe, expect, it } from "vitest";
import { Group, GroupId } from "../../../../src/Group/Domain/Entities/Group";
import { GroupDomainError } from "../../../../src/Group/Domain/Entities/Group";
import { Quantity } from "../../../../src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "../../../../src/Group/Domain/ValueObjects/Expiry";
import { Unit } from "../../../../src/Group/Domain/ValueObjects/Unit";
import { Food, FoodId } from "../../../../src/Group/Domain/Entities/Food";
import {
	Container,
	ContainerId,
} from "../../../../src/Group/Domain/Entities/Container";
import { User, UserId } from "../../../../src/User";
import { EmailAddress } from "../../../../src/User/Domain/ValueObject/EmailAddress";
import { Username } from "../../../../src/User/Domain/ValueObject/Username";

describe("Group Object", () => {
	const unit = Unit.create({ name: "g" }).value!;
	const quantity = Quantity.create(100).value!;
	const expiry = Expiry.create({ date: new Date(2023, 11, 1) }).value!;
	const foodId = FoodId.create("foodId").value!;
	const anotherFoodId = FoodId.create("anotherFoodId").value!;
	const foodProps = {
		name: "dummy food name",
		unit: unit,
		quantity: quantity,
		expiry: expiry,
	};
	const food = Food.create(foodId, foodProps).value!;
	const anotherFood = Food.create(anotherFoodId, foodProps).value!;

	const containerId = ContainerId.create("containerId").value!;
	const anotherContainerId = ContainerId.create("anotherContainerId").value!;
	const containerProps = {
		name: "dummy container name",
		foods: [food, anotherFood],
	};
	const container = Container.create(containerId, containerProps).value!;
	const anotherContainer = Container.create(anotherContainerId, containerProps)
		.value!;

	const userId = UserId.generate()!;
	const anotherUserId = UserId.generate()!;
	const username = Username.create("dummy user name");
	const emailAddress = EmailAddress.create("bar@nishiki.com").value;
	const user = User.create(userId, {
		username,
		emailAddress,
	});
	const anotherUser = User.create(anotherUserId, {
		username,
		emailAddress,
	});

	const groupId = GroupId.create("GroupId");
	const GroupProps = {
		name: "dummy Group name",
		containers: [container, anotherContainer],
		users: [user, anotherUser],
	};

	describe("Group Object Constructor", () => {
		describe("creating Group object", () => {
			it("success", () => {
				const group = Group.create(GroupId, {
					...GroupProps,
				});
				expect(group.ok).toBeTruthy();
				expect(group.value!.name).toBe(GroupProps.name);
			});
		});
	});

	describe("Group Object methods", () => {
		const group = Group.create(GroupId, {
			...GroupProps,
		}).value!;

		describe("change Group name", () => {
			it("change Group name", () => {
				const changedGroupName = "changedGroupName";
				const changedGroup = group.changeName(changedGroupName).value!;
				expect(changedGroup.name).toBe(changedGroupName);
			});
			it("change Group name with too short name", () => {
				const changedGroupName = "";
				const changedGroup = group.changeName(changedGroupName);
				expect(changedGroup.error).instanceOf(GroupDomainError);
			});
		});

		describe("change Group containers", () => {
			it("add Group container", () => {
				const extraContainer = Container.create("extra container id", {
					...containerProps,
					name: "extra container",
				}).value!;

				const changedGroup = group.addContainer(extraContainer).value!;
				expect(changedGroup.containers).toMatchObject([
					...group.containers,
					extraContainer,
				]);
			});

			it("attempt to add existing container", () => {
				const changedGroup = group.addContainer(container);
				expect(changedGroup.error).instanceOf(GroupDomainError);
			});

			it("remove Group container", () => {
				const changedGroup = group.removeContainer(container.id).value!;
				console.log("changedGroup", changedGroup.containers);

				expect(changedGroup.containers).toMatchObject([anotherContainer]);
			});

			it("attempt to remove container which isn't included", () => {
				const extraContainerId =
					ContainerId.create("extra container id").value!;
				const changedGroup = group.removeContainer(extraContainerId.id);
				expect(changedGroup.error).instanceOf(GroupDomainError);
			});
		});
	});
});
