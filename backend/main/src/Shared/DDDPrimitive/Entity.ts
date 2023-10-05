import { Identifier, Result } from "src/Shared";

/**
 * This is an entity class.
 * This class is used to represent the entity object in the DDD context.
 * This is an abstract class and must be inherited by subclass.
 * The constructor is protected which means you have to implement a static method for generation.
 * You must write validation in that method.
 *
 * @example
 * ```ts
 * class SubClass extends Entity<Identifier<string>, string> {
 *      static create(id: Identifier<string>, props: string): Result<SubClass> {
 *          if (invalidInput) {
 *              return Err("INVALID INPUT")
 *          };
 *          return Ok(new SubClass(id, props));
 *      }
 * }
 * ```
 */
export abstract class Entity<T, K> {
    private readonly _id: Identifier<T>;
    private _props: K

    /**
     * The constructor is private.
     * To create an instance, call a crete method.
     * @param id
     * @param props
     * @private
     */
    protected constructor (id: Identifier<T>, props: K) {
        this._id = id;
        this._props = props;
    }

    /**
     * return this ID
     */
    get id(): Identifier<T> {
        return this._id;
    }
}
