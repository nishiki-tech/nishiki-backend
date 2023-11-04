import { describe, expect, it } from "vitest";
import {
	Container,
	ContainerId,
} from "../../../../src/Group/Domain/Entities/Container";
import { ContainerDomainError } from "../../../../src/Group/Domain/Entities/Container";
import { Quantity } from "../../../../src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "../../../../src/Group/Domain/ValueObjects/Expiry";
import { Unit } from "../../../../src/Group/Domain/ValueObjects/Unit";
import { Food, FoodId } from "../../../../src/Group/Domain/Entities/Food";

describe("Container Object", () => {
	describe("creating container object", () => {
		const unit = Unit.create({ name: "g" });
		const quantity = Quantity.create(100);
		const expiry = Expiry.create({ date: new Date(2023, 11, 1) });
		const foodId = FoodId.create("foodId");
		const foodProps = {
			name: "dummy container name",
			unit: unit,
			quantity: quantity,
			expiry: expiry,
		};
		const food = Food.create(foodId, foodProps).value!;

		const containerId = ContainerId.create("containerId");
		const containerProps = {
			name: "dummy container name",
			foods: [food],
		};

		it("success", () => {
			const container = Container.create(containerId, {
				...containerProps,
			});
			expect(container.ok).toBeTruthy();
			expect(container.value!.name).toBe(containerProps.name);
		});

		it("container name too long", () => {
			const container = Container.create(containerId, {
				...containerProps,
				name: "abcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqrstuv", // 256 characters
			});
			expect(container.ok).toBeFalsy();
		});
	});
});

describe("Container Object", () => {
	const unit = Unit.create({ name: "g" });
	const quantity = Quantity.create(100);
	const expiry = Expiry.create({ date: new Date(2023, 11, 1) });
	const foodId = FoodId.create("foodId");
	const foodProps = {
		name: "dummy container name",
		unit: unit,
		quantity: quantity,
		expiry: expiry,
	};
	const food = Food.create(foodId, foodProps).value!;

	const containerId = ContainerId.create("containerId");
	const containerProps = {
		name: "dummy container name",
		foods: [food],
	};
	const container = Container.create(containerId, {
		...containerProps,
	}).value!;

	describe("change container name", () => {
		it("change container name", () => {
			const changedContainerName = "changedContainerName";
			const changedContainer =
				container.changeName(changedContainerName).value!;
			expect(changedContainer.name).toBe(changedContainerName);
		});
		it("change container name with too short name", () => {
			const changedContainerName = "";
			const changedContainer = container.changeName(changedContainerName);
			expect(changedContainer.error).instanceOf(ContainerDomainError);
		});
	});

	describe("change container foods", () => {
		it("add container food", () => {
			const extraFood = Food.create("extra food id", {
				...foodProps,
				name: "extra food",
			}).value!;

			const changedContainer = container.addFood(extraFood).value!;
			expect(changedContainer.foods).toMatchObject([food, extraFood]);
		});

		it("attempt to add existing food", () => {
			const changedContainer = container.addFood(food);
			expect(changedContainer.error).instanceOf(ContainerDomainError);
		});

		it("remove container food", () => {
			const changedContainer = container.removeFood(food.id).value!;
			expect(changedContainer.foods).toMatchObject([]);
		});

		it("attempt to remove food which isn't included", () => {
			const extraFoodId = FoodId.create("extra food id").value!;
			const changedContainer = container.removeFood(extraFoodId.id);
			expect(changedContainer.error).instanceOf(ContainerDomainError);
		});
	});
});
