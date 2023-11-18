import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { userRouter } from "src/User/Router/UserRouter";

const app = new Hono();

userRouter(app);

export const handler = handle(app);
