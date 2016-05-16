import logger from '@financial-times/n-logger';

const MASK_SEQUENCE = '*****';

class SafeLogger {

	constructor (sensitiveFields=[]) {
		this.sensitiveFields = sensitiveFields;
	}

	info (message) {
		return this.log('info', message);
	}

	warn (message) {
		return this.log('warn', message);
	}

	error (message) {
		return this.log('error', message);
	}

	log (type, message) {
		let maskedMessage;

		if (typeof message === 'object') {
			maskedMessage = {};
			maskedMessage = this.maskMessage(message);
			logger.info(JSON.stringify(maskedMessage));
			return JSON.stringify(maskedMessage);
		}
		else {
			maskedMessage = message;
			for (const field of this.sensitiveFields) {
				if (message.indexOf(field) !== -1) {
					maskedMessage = MASK_SEQUENCE;
					break;
				}
			}
			logger[type](maskedMessage);
			return maskedMessage;
		}
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
							if (message[field].indexOf(sensitiveField) !== -1) {
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
