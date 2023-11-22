import { Stage } from "./nishiki-backend-resource-types"

/**
 * This function returns stage name based on the environment variable.
 * If the environment variable is not set, it returns 'dev'.
 * If the environment variable is set to 'prod', it returns 'prod'.
 * If the environment variable is set to 'dev' or 'prod' or undefined, it throws error.
 */
export const stageName = (): Stage => {
    // undefined or 'dev'.
    if (!process.env.STAGE || process.env.STAGE === "dev") {
        return "dev"
    }

    if (process.env.STAGE === "prod") {
        return "prod"
    }

    throw new Error("STAGE is not set or set to invalid value.")
}

/**
 * This function takes a resource name and the stage name.
 * If the stage name is not provided or 'dev', it returns the resource name with '-dev' suffix.
 * If the stage name is 'prod', it just returns the resource name.
 * @param {string} resourceName - The name of the resource.
 * @param {Stage} stageName - The name of the stage.
 * @returns {string} - The name of the resource with the stage suffix.
 *
 * @example
 * // when in the prod stage.
 * ```ts
 * const resourceName = "my-resource";
 * const stageName = "prod";
 * const resourceNameWithStage = resourceName(resourceName, stageName);
 * console.log(resourceNameWithStage); // "my-resource"
 * ```
 *
 * @example
 * // when in the dev stage.
 * ```ts
 * const resourceName = "my-resource";
 * const stageName = "dev";
 * const resourceNameWithStage = resourceName(resourceName, stageName);
 * console.log(resourceNameWithStage); // "my-resource-dev"
 * ```
 */
export const resourceName = (resourceName: string, stageName?: Stage): string => {
	if (stageName === "prod") {
		return resourceName;
	} else {
		return resourceName + "-dev";
	}
}