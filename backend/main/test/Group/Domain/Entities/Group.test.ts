import { describe, expect, it } from "vitest";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { GroupDomainError } from "src/Group/Domain/Entities/Group";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import { UserId } from "src/User";

describe("Group Object", () => {
	const containerId = ContainerId.generate();
	const anotherContainerId = ContainerId.generate();

	const userId = UserId.generate()!;
	const anotherUserId = UserId.generate()!;

	const groupId = GroupId.create("GroupId").unwrap();
	const GroupProps = {
		name: "dummy Group name",
		containerIds: [containerId, anotherContainerId],
		userIds: [userId, anotherUserId],
	};

	describe("Group Object Constructor", () => {
		describe("creating Group object", () => {
			it("success", () => {
				const group = Group.create(groupId, {
					...GroupProps,
				});
				expect(group.ok).toBeTruthy();
				expect(group.unwrap().name).toBe(GroupProps.name);
			});
		});
	});

	describe("Group Object methods", () => {
		const group = Group.create(groupId, {
			...GroupProps,
		}).unwrap();

		describe("change Group name", () => {
			it("change Group name", () => {
				const changedGroupName = "changedGroupName";
				const changedGroup = group.changeName(changedGroupName).unwrap();
				expect(changedGroup.name).toBe(changedGroupName);
			});
			it("change Group name with too short name", () => {
				const changedGroupName = "";
				const changedGroup = group.changeName(changedGroupName);
				expect(changedGroup.unwrapError()).instanceOf(GroupDomainError);
			});
		});

		describe("change Group containerIds", () => {
			it("add Group container", () => {
				const extraContainerId = ContainerId.generate();

				const changedGroup = group.addContainerId(extraContainerId).unwrap();
				expect(changedGroup.containerIds).toMatchObject([
					...group.containerIds,
					extraContainerId,
				]);
			});

			it("attempt to add existing container", () => {
				const changedGroup = group.addContainerId(containerId);
				expect(changedGroup.unwrapError()).instanceOf(GroupDomainError);
			});

			it("remove Group container", () => {
				const changedGroup = group.removeContainer(containerId).unwrap();
				expect(changedGroup.containerIds).toMatchObject([anotherContainerId]);
			});

			it("attempt to remove container which isn't included", () => {
				const extraContainerId = ContainerId.generate();
				const changedGroup = group.removeContainer(extraContainerId);
				expect(changedGroup.unwrapError()).instanceOf(GroupDomainError);
			});
		});
	});
});
