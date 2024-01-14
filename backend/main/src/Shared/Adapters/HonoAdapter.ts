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
		return c.body(JSON.stringify(result.body));
	}
	if (typeof result.body === "string") {
		c.header("Content-Type", "text/plain");
		return c.json(result.body);
	}
	return c.body(null);
};

/**
 * This is the just wrapper of the Hono.
 * This returns 200 OK.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200
 * @param c
 * @param data
 */
export const honoOkResponseAdapter = (
	c: Context,
	data: object | string | null,
): Response => {
	if (typeof data === "string") {
		c.header("Content-Type", "text/json");
		c.status(200);
		return c.text(data);
	}
	c.header("Content-Type", "application/json");
	c.status(200);
	return c.json(JSON.stringify(data));
};

/**
 * This is the just wrapper of the Hono.
 * This returns 201 OK.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201
 * @param c
 * @param data
 */
export const honoCreatedResponseAdapter = (
	c: Context,
	data: object | string | null,
): Response => {
	if (typeof data === "string") {
		c.header("Content-Type", "text/json");
		c.status(201);
		return c.text(data);
	}
	c.header("Content-Type", "application/json");
	c.status(201);
	return c.json(JSON.stringify(data));
};

/**
 * This is the just wrapper of the Hono.
 * This returns 404 Not Found.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404
 * @param c
 */
export const honoNotFoundAdapter = (c: Context): Response => {
	c.header("Content-Type", "text/plain");
	c.status(404);
	return c.text("Not Found");
};

/**
 * This is the just wrapper of the Hono.
 * This returns 400 Bad Request.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400
 * @param c
 * @param message - a message to send to the client.
 */
export const honoMethodBadRequestAdapter = (
	c: Context,
	message: string,
): Response => {
	c.header("Content-Type", "text/plain");
	c.status(400);
	return c.text(message);
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
 * This returns 500 Bad Request.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500
 * @param c
 * @param errorMessage - the error message to return.
 */
export const honoInternalServerErrorAdapter = (
	c: Context,
	errorMessage: string,
): Response => {
	c.header("Content-Type", "text/plain");
	c.status(500);
	return c.text(errorMessage);
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
