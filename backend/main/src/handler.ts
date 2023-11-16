import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

export const handler = handle(app);
