import logger from '@financial-times/n-logger';

const MASK_SEQUENCE = '*****';

class SafeLogger {

	constructor (sensitiveFields=[]) {
		this.sensitiveFields = sensitiveFields;
	}

	info (...args) {
		return this.log('info', ...args);
	}

	warn (...args) {
		return this.log('warn', ...args);
	}

	error (...args) {
		return this.log('error', ...args);
	}

	log (type, ...messages) {
		let maskedMessage;

		let result = [];

		for (const message of messages) {
			if (typeof message === 'object') {
				maskedMessage = {};
				maskedMessage = this.maskMessage(message);
				result.push(JSON.stringify(maskedMessage));
			}
			else {
				maskedMessage = message;
				for (const field of this.sensitiveFields) {
					if (message.indexOf(field) !== -1) {
						maskedMessage = MASK_SEQUENCE;
						break;
					}
				}
				result.push(maskedMessage);
			}
		}

		const resultStr = result.join(' ');

		logger[type](resultStr);
		return resultStr;

	}

	maskMessage (message) {
		let clonedMessage = JSON.parse(JSON.stringify(message));
		let maskedField;

		for (const field in message) {

			if (message.hasOwnProperty(field)){

				if (typeof message[field] === 'object') {
					maskedField = this.maskMessage(message[field]);
					clonedMessage[field] = maskedField;
				}
				else {
					if (this.sensitiveFields.indexOf(field) !== -1) {
						// Object KEY is a sentisitve field, mask the VALUE
						clonedMessage[field] = MASK_SEQUENCE;
					}
					else {
						// Does the VALUE of a safe KEY contain a sensitive word in itself?
						for (const sensitiveField of this.sensitiveFields) {
							if (message[field] && typeof message[field] === 'string' && message[field].length > 0 && message[field].indexOf(sensitiveField) !== -1) {
								clonedMessage[field] = MASK_SEQUENCE;
								break;
							}
						}
					}
				}
			}
		}
		return clonedMessage;
	}
}
export default SafeLogger;
