import { describe, expect, it } from "vitest";
import {
	Container,
	ContainerId,
} from "../../../../src/Group/Domain/Entities/Container";
import { ContainerDomainError } from "../../../../src/Group/Domain/Entities/Container";
import { Quantity } from "../../../../src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "../../../../src/Group/Domain/ValueObjects/Expiry";
import { Unit } from "../../../../src/Group/Domain/ValueObjects/Unit";
import { Food } from "../../../../src/Group/Domain/Entities/Food";

describe("Container Object", () => {
	describe("creating container object", () => {
		const unit = Unit.create({ name: "g" });
		const quantity = Quantity.create(100);
		const expiry = Expiry.create({ date: new Date(2023, 11, 1) });
		const foodId = "foodId";
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
				name: "abcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxy", // 51 characters
			});
			expect(container.ok).toBeFalsy();
		});
	});
});

describe("Container Object", () => {
	const unit = Unit.create({ name: "g" });
	const quantity = Quantity.create(100);
	const expiry = Expiry.create({ date: new Date(2023, 11, 1) });
	const foodId = "foodId";
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
	});

	describe("change container foods", () => {
		it("add container food", () => {
			const extraFood = Food.create(foodId, {
				...foodProps,
				name: "extra food",
			}).value!;

			const changedContainer = container.addFood(extraFood).value!;
			expect(changedContainer.foods).toMatchObject([food, extraFood]);
		});

		it("remove container food", () => {
			const changedContainer = container.removeFood(food).value!;
			expect(changedContainer.foods).toMatchObject([]);
		});

		it("attempt to remove food which isn't included", () => {
			const extraFood = Food.create("extra food", {
				...foodProps,
			}).value!;

			const changedContainer = container.removeFood(extraFood);
			expect(changedContainer.error).instanceOf(ContainerDomainError);
		});
	});
});
