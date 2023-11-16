import { APIGatewayProxyResultV2 } from "aws-lambda";

interface IResult {
	status: StatusType;
	statusCode: number;
	body?: string | null | object;
}

type StatusType =
	| "OK"
	| "CREATED"
	| "ACCEPTED"
	| "BAD_REQUEST"
	| "NOT_FOUND"
	| "METHOD_NOT_ALLOWED"
	| "INTERNAL_SERVER_ERROR"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "NOT_IMPLEMENTED";

export abstract class Controller<T> {
	protected abstract handler(input?: T): Promise<IResult>;

	public async execute(): Promise<IResult> {
		try {
			return await this.handler();
		} catch (err) {
			if (err instanceof Error) {
				console.error(err.message);
				return this.internalServerError(err.message);
			}

			return this.internalServerError("unexpected error");
		}
	}

	/**
	 * OK
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200}
	 * status code: 200
	 * body: serialized json string. it can be null.
	 *
	 * You can set an object in the argument. IF so, the object is serialized.
	 * @param body
	 */
	ok(body?: string | object | null): IResult {
		return {
			status: "OK",
			statusCode: 200,
			body,
		};
	}

	/**
	 * Created
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201}
	 * status code: 201
	 * body: serialized json string. it can be null.
	 *
	 * You can set an object in the argument. IF so, the object is serialized.
	 * @param body
	 */
	created(body?: string | object | null): IResult {
		return {
			status: "CREATED",
			statusCode: 201,
			body,
		};
	}

	/**
	 * accepted
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202}
	 * status code: 202
	 */
	accepted(): IResult {
		return {
			status: "ACCEPTED",
			statusCode: 202,
		};
	}

	/**
	 * Bad Request
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400}
	 * status code: 400
	 * body: string | object | undefined | null
	 */
	badRequest(body?: string | object | null): IResult {
		return {
			status: "BAD_REQUEST",
			statusCode: 400,
			body: body
				? typeof body === "string"
					? body
					: JSON.stringify(body)
				: undefined,
		};
	}

	/**
	 * Unauthorized
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401}
	 * status code: 401
	 * body: string | undefined | null
	 */
	unauthorized(body?: string | null): IResult {
		return {
			status: "UNAUTHORIZED",
			statusCode: 401,
			body: JSON.stringify(body),
		};
	}

	/**
	 * Forbidden
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403}
	 * status code: 403
	 * body: string | undefined | null
	 */
	forbidden(body?: string | null): IResult {
		return {
			status: "FORBIDDEN",
			statusCode: 403,
			body: JSON.stringify(body),
		};
	}

	/**
	 * Not Found
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404}
	 * status code: 404
	 * body: string | undefined | null
	 */
	notFound(body?: string | null): IResult {
		return {
			status: "NOT_FOUND",
			statusCode: 404,
			body: JSON.stringify(body),
		};
	}

	/**
	 * Method Not Allowed
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405}
	 * status code: 405
	 * body: string | undefined | null
	 */
	methodNotAllowed(body?: string | null): IResult {
		return {
			status: "METHOD_NOT_ALLOWED",
			statusCode: 405,
			body: JSON.stringify(body),
		};
	}

	/**
	 * Internal Server Error
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500}
	 * status code: 500
	 * body: string | undefined
	 */
	internalServerError(message?: string): IResult {
		return {
			status: "INTERNAL_SERVER_ERROR",
			statusCode: 500,
			body: JSON.stringify(message),
		};
	}

	/**
	 * Not Implemented
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501}
	 * status code: 501
	 */
	notImplemented(): APIGatewayProxyResultV2 {
		return {
			statusCode: 501,
		};
	}
}
