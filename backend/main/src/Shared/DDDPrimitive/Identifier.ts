import {Result} from "../Types/Result";

interface IIdentifierProps {
    [index : string]: any
}

type T = string | number | IIdentifierProps;

/**
 * Interface of the identifier.
 * The ID is not determined to be only one.
 * It can be more than single element because the ID will be a combination of some elements.
 * To create an instance you must implement the static method because this constructor is protected.
 */
export abstract class Identifier<T> {
    private _id: T

    /**
     * Construct should be private.
     * Call this in the static method along with implementing validation.
     * @param id
     * @private
     */
    protected constructor (id: T) {
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
}
