import logger from '@financial-times/n-logger';

const MASK_SEQUENCE = '*****';

class SafeLogger {

	constructor (sensitiveFields=[]) {
		this.safeLogger = logger;
		this.sensitiveFields = sensitiveFields;
	}

	info (message) {

		let maskedMessage = message;

		if (typeof message === 'object') {

			let mask = {};

			for (const field of this.sensitiveFields) {

				if (message[field]) {
					mask[field] = MASK_SEQUENCE;
				}
			}
			maskedMessage = Object.assign({}, message, mask);
		}
		else {
			for (const field of this.sensitiveFields) {
				if (message.indexOf(field) !== -1) {
					maskedMessage = MASK_SEQUENCE;
					break;
				}
			}
		}
		logger.info('maskedMessage', maskedMessage);
	}
}

export default SafeLogger;