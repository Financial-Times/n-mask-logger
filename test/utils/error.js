export class AnotherError extends Error {

	constructor(message, data) {
		super(message);
		this.data = data;
	}
}
