interface ValueObjectProps {
    [index: string]: any;
}

/**
 * This is the value object class in DDD context.
 * All fields are public but readonly.
 * This is an abstract class and must be inherited by subclass.
 * The constructor is protected which means you have to implement a static method for generation.
 * You must write validation in that method.
 *
 * @example
 * ```ts
 * class SubClass extends ValueObject<IValueProps> {
 *      static create(props: IValueProps): Result<SubClass> {
 *          if (invalidInput) {
 *              return Err("INVALID INPUT")
 *          };
 *          return Ok(new SubClass(props));
 *      }
 * }
 */
export abstract class ValueObject<T extends ValueObjectProps> {
    readonly props: T

    protected constructor(props: T) {
        this.props = props;
    }

    /**
     * compare if the same value object or not.
     * @param otherValueObject
     * @return boolean
     */
    public equal(otherValueObject: ValueObject<T>): boolean {
        if (otherValueObject === null || otherValueObject === undefined) {
            return false
        }

        if (otherValueObject.props === null || otherValueObject.props === undefined) {
            return false
        }

        return JSON.stringify(this.props) === JSON.stringify(otherValueObject.props)
    }

}