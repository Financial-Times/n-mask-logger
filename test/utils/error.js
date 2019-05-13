export class AnotherError extends Error {

	constructor (message, data, info) {
		super(message);
		this.data = data;
		this.info = info;
	}
}
