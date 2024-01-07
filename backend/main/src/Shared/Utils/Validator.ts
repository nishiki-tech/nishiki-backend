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

/**
 * Check if the given string is MD5.
 * @param md5String - MD5 string
 */
export const isMd5 = (md5String: string): boolean => {
	const md5Regex = /^[a-f0-9]{32}$/i;
	return md5Regex.test(md5String);
}
