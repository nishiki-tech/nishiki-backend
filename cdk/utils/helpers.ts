import { Stage } from "./nishiki-backend-resource-types";

/**
 * This function returns stage name based on the environment variable.
 * If the environment variable is not set, it returns 'dev'.
 * If the environment variable is set to 'prod', it returns 'prod'.
 * If the environment variable is set to 'dev' or 'prod' or undefined, it throws error.
 */
export const stageName = (): Stage => {
	// undefined or 'dev'.
	if (!process.env.STAGE || process.env.STAGE === "dev") {
		return "dev";
	}

	if (process.env.STAGE === "prod") {
		return "prod";
	}

	throw new Error("STAGE is not set or set to invalid value.");
};
