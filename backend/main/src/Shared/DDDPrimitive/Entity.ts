import { Identifier } from "./Identifier";
import {Result} from "../Types/Result";

/**
 * This is an entity class.
 * This class is used to represent the entity object in the DDD context.
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
    private constructor (id: Identifier<T>, props: K) {
        this._id = id;
        this._props = props;
    }

    /**
     * return this ID
     */
    get id(): Identifier<T> {
        return this._id;
    }

    /**
     * This method is used to create an instance.
     * Inside this method, you write a validation of the input value.
     * If all validation is passed, call the constructor.
     * @param id
     * @param props
     * @return Reust<this>
     */
    abstract create(id: Identifier<T>, props: K): Result<this>;
}
