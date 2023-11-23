import { Context } from "hono";
import { ControllerResultType } from "src/Shared";

/**
 * Hono Response Adapter
 * If the result is the object, return json.
 * If the result is the string, return text.
 * Else return null body.
 * @param c - the context of Hono
 * @param result - the response of the controller
 */
export const honoResponseAdapter = <T>(
	c: Context,
	result: ControllerResultType<T>,
): Response => {

	c.status(result.statusCode);

	if (typeof result.body === "object") {
		c.header("Content-Type", "application/json");
		return c.json(result.body)
	}
	if (typeof result.body === "string") {
		c.header("Content-Type", "text/plain");
		return c.json(result.body)
	}
	return c.body(null);
};

/**
 * This is the just wrapper of the Hono.
 * This returns 405 Not Implemented.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501
 * @param c
 */
export const honoMethodNotAllowAdapter = (c: Context): Response => {
	c.header("Content-Type", "text/plain");
	c.status(405);
	return c.text("Method Not Allowed");
};

/**
 * This is the just wrapper of the Hono.
 * This returns 501 Not Implemented.
 * Used when it is implemented that will be implemented future.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501
 * @param c
 */
export const honoNotImplementedAdapter = (c: Context): Response => {
	c.header("Content-Type", "text/plain");
	c.status(501);
	return c.text("Not Implemented");
};
