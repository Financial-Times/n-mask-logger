import logger from '@financial-times/n-logger';

const MASK_SEQUENCE = '*****';

export default class {

	constructor (sensitiveFields = []) {
		const fieldsToMask = sensitiveFields.join('|');
		this.sensitiveFields = new RegExp(`(${fieldsToMask})[\\\s]*\\=[\\\s]*[\\\]?[\\"\\']?([\\S]+)[\\\]?[\\"\\']?|(${fieldsToMask})`, 'ig');
	}

	debug (...args) {
		return this.log('debug', ...args);
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
					const shouldMask = this.sensitiveFields.test(message);
					return shouldMask ? this.maskString(message) : message;
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
			if (value instanceof Error) {
				currentMaskedObject[key] = this.extractErrorDetails(value);
			} else if (typeof value === 'object' && value !== null) {
				this.sensitiveFields.test(key);
				currentMaskedObject[key] = Object.keys(value).reduce(reduceObject.bind(this, value), { });
			} else if (typeof value === 'string') {
				const shouldMask = this.sensitiveFields.test(key) || this.sensitiveFields.test(value);
				currentMaskedObject[key] = shouldMask ? MASK_SEQUENCE : value;
			} else {
				currentMaskedObject[key] = value;
			}

			return currentMaskedObject;
		};

		return Object.keys(nakedObject).reduce(reduceObject.bind(this, nakedObject), { });
	}

	maskString (rawString) {
		return rawString.replace(this.sensitiveFields, (match, p1) => {
			return p1 ? `${p1}="${MASK_SEQUENCE}"` : MASK_SEQUENCE;
		});
	}

	extractErrorDetails (obj) {
		if (obj instanceof Error) {
			const deets = {
				error_message: obj.message,
				error_name: obj.name
			};
			if (obj.data) {
				deets.error_data = this.maskObject(obj.data);
			}
			if ('stack' in obj) {
				deets.error_stack = obj.stack;
			}

			return deets;
		} else {
			return obj;
		}
	}

}
