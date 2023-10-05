import {Result} from "../Types/Result";

interface IIdentifierProps {
    [index : string]: any
}

type T = string | number | IIdentifierProps;

/**
 * Interface of the identifier.
 * The ID is not determined to be only one.
 * It can be more than single element because the ID will be a combination of some elements.
 */
export abstract class Identifier<T> {
    private _id: T

    /**
     * This is private constructor.
     * Call it in the create method.
     * @param id
     * @private
     */
    private constructor (id: T) {
        this._id = id;
    }

    /**
     * check if the identifier is the same.
     * @param identifier
     * @return boolean
     */
    equal(identifier: Identifier<T>): boolean {
        if (!(identifier instanceof this.constructor)) {
            return false
        }

        return this._id === identifier.id;
    }

    get id(): T {
        return this._id;
    }

    /**
     * You implement validation in this method and you call the constructor in this method
     * @param id
     * @return this
     */
    abstract create(id: T): Result<this>
}
