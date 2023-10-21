interface IIdentifierProps {
	// biome-ignore lint/suspicious/noExplicitAny: this will be specified when writing a concrete class
	[index: string]: any;
}

type T = string | number | IIdentifierProps;

/**
 * The Identifier class represents identifier in DDD context.
 * The ID is not determined to be only one.
 * It can be more than single element because the ID will be a combination of some elements.
 *
 * This is an abstract class and must be inherited by subclass.
 * The constructor is protected which means you have to implement a static method for generation.
 * You must write validation in that method.
 *
 * @example
 * ```ts
 * class SubClass extends Identifier<string> {
 *      static create(id: string): Result<SubClass> {
 *          if (invalidInput) {
 *              return Err("INVALID")
 *          };
 *          return Ok(new SubClass(id));
 *      }
 * }
 * ```
 */
export abstract class Identifier<T> {
	private _id: T;

	/**
	 * Construct should be private.
	 * Call this in the static method along with implementing validation.
	 * @param id
	 * @private
	 */
	protected constructor(id: T) {
		this._id = id;
	}

	/**
	 * check if the identifier is the same.
	 * @param identifier
	 * @return boolean
	 */
	equal(identifier: Identifier<T>): boolean {
		if (!(identifier instanceof this.constructor)) {
			return false;
		}

		return this._id === identifier.id;
	}

	get id(): T {
		return this._id;
	}
}
