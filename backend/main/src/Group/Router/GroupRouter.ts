import { Hono } from "hono";
import { honoNotImplementedAdapter } from "src/Shared/Adapters/HonoAdapter";

/**
 * This is a Group router.
 * https://genesis-tech-tribe.github.io/nishiki-documents/web-api/index.html#tag/group
 * @param app
 */
export const groupRouter = (app: Hono) => {
	app.get("/groups", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.post("/groups", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.get("/groups/:groupId", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.get("/groups/:groupId/containers", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.get("/groups/:groupId/users", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.put("/groups/:groupId/users/:userId", async (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.delete("/groups/:groupId/users/:userId", async (c) => {
		return honoNotImplementedAdapter(c);
	});
};
