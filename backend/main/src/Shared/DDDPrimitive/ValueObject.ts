interface ValueObjectProps {
    [index: string]: any;
}

/**
 * This is the value object class.
 * All fields are public but readonly.
 */
export abstract class ValueObject<T extends ValueObjectProps> {
    readonly props: T

    protected constructor(props: T) {
        this.props = props;
    }

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