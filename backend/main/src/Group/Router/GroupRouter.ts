import { Hono } from "hono";
import { honoNotImplementedAdapter } from "src/Shared/Adapters/HonoAdapter";

/**
 * This is a Group router.
 * https://genesis-tech-tribe.github.io/nishiki-documents/web-api/index.html#tag/group
 * @param app
 */
export const groupRouter = (app: Hono) => {
	app.get("/groups", (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.post("/groups", (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.get("/groups/:groupId", (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.get("/groups/:groupId/containers", (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.get("/groups/:groupId/users", (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.put("/groups/:groupId/users/:userId", (c) => {
		return honoNotImplementedAdapter(c);
	});

	app.delete("/groups/:groupId/users/:userId", (c) => {
		return honoNotImplementedAdapter(c);
	});
};
