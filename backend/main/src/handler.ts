import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { authRouter, userRouter } from "src/User";
import { containerRouter, groupRouter } from "src/Group";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", logger());
app.use(
	"*",
	cors({ origin: ["http://localhost:3000", "https://nishiki.tech"] }),
);

userRouter(app); // /users
authRouter(app); // /auth
containerRouter(app); // /containers
groupRouter(app); // /groups

export const handler = handle(app);
