import {Result} from "../Types/Result";

interface ValueObjectProps {
    [index: string]: any;
}

export abstract class ValueObject<T extends ValueObjectProps> {
    readonly props: T

    private constructor(props: T) {
        this.props = props;
    }

    abstract create(props: T): Result<this>
}