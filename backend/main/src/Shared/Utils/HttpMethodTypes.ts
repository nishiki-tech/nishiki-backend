export type OkStatus<T> = {
	status: "OK";
	statusCode: 200;
	body?: T;
};

export type CreatedStatus<T> = {
	status: "CREATED";
	statusCode: 201;
	body?: T;
};

export type AcceptedStatus = {
	status: "ACCEPTED";
	statusCode: 202;
	body: undefined
};

export type NoContentStatus = {
	status: "NO_CONTENT";
	statusCode: 204;
	body: undefined
};

export type BadRequestStatus = {
	status: "BAD_REQUEST";
	statusCode: 400;
	body?: string | object;
};

export type UnauthorizedStatus = {
	status: "UNAUTHORIZED";
	statusCode: 401;
	body?: string | object;
};

export type ForbiddenStatus = {
	status: "FORBIDDEN";
	statusCode: 403;
	body?: string | object;
};

export type MethodNotAllowedStatus = {
	status: "METHOD_NOT_ALLOWED";
	statusCode: 405;
	body?: string | object;
};

export type InternalServerErrorStatus = {
	status: "INTERNAL_SERVER_ERROR";
	statusCode: 500;
	body?: string | object;
};

export type NotImplementedStatus = {
	status: "NOT_IMPLEMENTED";
	statusCode: 501;
	body: string;
};
