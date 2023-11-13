import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	test: {
		includeSource: ["test/**/*.test.ts"],
	},
	plugins: [tsconfigPaths()],
});
