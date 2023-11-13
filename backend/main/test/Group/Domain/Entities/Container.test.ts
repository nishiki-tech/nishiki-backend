import { describe, expect, it } from "vitest";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { ContainerDomainError } from "src/Group/Domain/Entities/Container";
import { Quantity } from "src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "src/Group/Domain/ValueObjects/Expiry";
import { Unit } from "src/Group/Domain/ValueObjects/Unit";
import { Food, FoodId } from "src/Group/Domain/Entities/Food";

describe("Container Object", () => {
	const unit = Unit.create({ name: "g" }).unwrap();
	const quantity = Quantity.create(100).unwrap();
	const expiry = Expiry.create({ date: new Date(2023, 11, 1) }).unwrap();
	const foodId = FoodId.create("foodId").unwrap();
	const foodProps = {
		name: "dummy container name",
		unit: unit,
		quantity: quantity,
		expiry: expiry,
	};
	const food = Food.create(foodId, foodProps).unwrap();

	const containerId = ContainerId.create("containerId").unwrap();
	const containerProps = {
		name: "dummy container name",
		foods: [food],
	};
	describe("Container Object Constructor", () => {
		describe("creating container object", () => {
			it("success", () => {
				const container = Container.create(containerId, {
					...containerProps,
				});
				expect(container.ok).toBeTruthy();
				expect(container.unwrap().name).toBe(containerProps.name);
			});

			it("container name too long", () => {
				const container = Container.create(containerId, {
					...containerProps,
					name: "abcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxyzabcdefghijklmnopqrstuv", // 256 characters
				});
				expect(container.ok).toBeFalsy();
			});

			it("container name too short", () => {
				const container = Container.create(containerId, {
					...containerProps,
					name: "",
				});
				expect(container.ok).toBeFalsy();
			});
		});
	});

	describe("Container Object methods", () => {
		const container = Container.create(containerId, {
			...containerProps,
		}).unwrap();

		describe("change container name", () => {
			it("change container name", () => {
				const changedContainerName = "changedContainerName";
				const changedContainer = container
					.changeName(changedContainerName)
					.unwrap();
				expect(changedContainer.name).toBe(changedContainerName);
			});
			it("change container name with too short name", () => {
				const changedContainerName = "";
				const changedContainer = container.changeName(changedContainerName);
				expect(changedContainer.unwrapError()).instanceOf(ContainerDomainError);
			});
		});

		describe("change container foods", () => {
			it("add container food", () => {
				const extraFood = Food.create(FoodId.create("extra food id").unwrap(), {
					...foodProps,
					name: "extra food",
				}).unwrap();

				const changedContainer = container.addFood(extraFood).unwrap();
				expect(changedContainer.foods).toMatchObject([food, extraFood]);
			});

			it("attempt to add existing food", () => {
				const changedContainer = container.addFood(food);
				expect(changedContainer.unwrapError()).instanceOf(ContainerDomainError);
			});

			it("remove container food", () => {
				const changedContainer = container.removeFood(food.id).unwrap();
				expect(changedContainer.foods).toMatchObject([]);
			});

			it("attempt to remove food which isn't included", () => {
				const extraFoodId = FoodId.create("extra food id").unwrap();
				const changedContainer = container.removeFood(extraFoodId);
				expect(changedContainer.unwrapError()).instanceOf(ContainerDomainError);
			});
		});
	});
});
