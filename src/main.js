import logger from '@financial-times/n-logger';

const MASK_SEQUENCE = '*****';

export default class {

	constructor (sensitiveFields = []) {
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
		const maskedMessages = messages
			.map(message => {
				if (typeof message === 'object' && message !== null) {
					return this.maskObject(this.extractErrorDetails(message));
				} else if (typeof message === 'string') {
					const shouldMask = this.sensitiveFields.find(sensitiveField => message.includes(sensitiveField));
					return shouldMask ? MASK_SEQUENCE : message;
				} else {
					return message;
				}
			});
		logger[type].apply(logger, maskedMessages);

		return maskedMessages;
	}

	maskObject (nakedObject) {
		const reduceObject = (object, currentMaskedObject, key) => {
			const value = object[key];
			if (typeof value === 'object' && value !== null) {
				currentMaskedObject[key] = Object.keys(value).reduce(reduceObject.bind(this, value), { });
			} else if (typeof value === 'string') {
				const shouldMask = this.sensitiveFields.find(sensitiveField =>
					sensitiveField.toLowerCase() === key.toLowerCase() || value.includes(sensitiveField)
				);
				currentMaskedObject[key] = shouldMask ? MASK_SEQUENCE : value;
			} else {
				currentMaskedObject[key] = value;
			}

			return currentMaskedObject;
		};

		return Object.keys(nakedObject).reduce(reduceObject.bind(this, nakedObject), { });
	}

	extractErrorDetails (obj) {
		if (obj instanceof Error) {
			const deets = {
				error_message: obj.message,
				error_name: obj.name
			};
			if ('stack' in obj) {
				deets.error_stack = obj.stack;
			}

			return deets;
		} else {
			return obj;
		}
	}

}
