import { validate, version } from "uuid";

/**
 * Check if the given string is valid UUID V4.
 * https://github.com/uuidjs/uuid?tab=readme-ov-file#uuidvalidatestr
 * @param {string} uuid
 * @return {boolean}
 */
export const isValidUUIDV4 = (uuid: string): boolean => {
	return validate(uuid) && version(uuid) === 4;
};
