/**
 * Interface of the identifier.
 * The ID is not determined to be only one.
 * It can be more than single element because the ID will be a combination of some elements.
 */
export abstract class Identifier<T> {
    private _id: T
    constructor (id: T) {
        this._id = id;
    }

    get id(): T {
        return this._id;
    }
}
