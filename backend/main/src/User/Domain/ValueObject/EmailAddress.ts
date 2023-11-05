import { DomainObjectError, Err, Ok, Result, ValueObject } from "src/Shared";

interface IEmail {
	emailAddress: string;
}

/**
 * Email Address class
 */
export class EmailAddress extends ValueObject<IEmail> {
	private constructor(emailProps: IEmail) {
		super(emailProps);
	}

	static create(emailAddress: string): Result<EmailAddress, EmailAddressError> {
		const emailRegExp = new RegExp(
			"([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])",
		);

		if (!emailRegExp.test(emailAddress)) {
			return Err(new EmailAddressError("Incorrect Email Address"));
		}

		return Ok(new EmailAddress({ emailAddress }));
	}

	get emailAddress(): string {
		return this.props.emailAddress;
	}
}

export class EmailAddressError extends DomainObjectError {}
