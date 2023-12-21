import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { userRouter } from "src/User/Router/UserRouter";
import { containerRouter } from "./Group/Router/ContainerRouter";

const app = new Hono();

userRouter(app);
containerRouter(app);

export const handler = handle(app);
