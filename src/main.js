const logger = require('@financial-times/n-logger').default;

/**
 * MaskLogger Class
 * @example
 * const logger = new MaskLogger(['denyField'], ['allowField'], '*MASKED*');
 * logger.debug('Data which may contain sensitive information', data);
 */
class MaskLogger {
	/**
	 * Create a MaskLogger
	 * @param {array<string>} denyList Extra field names to mask
	 * @param {array<string>} allowList Field names to allow from the default deny list
	 * @param {string?} maskString Mask to be applied to sensitive values
	 */
	constructor (denyList = [], allowList = [], maskString = '*****') {
		this.maskString = maskString;
		this.maskList = [
			'email',
			'password',
			'name',
			'firstName',
			'lastName',
			'phone',
			'primaryTelephone',
			'postcode',
			'session',
			...denyList
		];

		// Remove items from maskList if they are in the allowList
		this.maskList = this.maskList.filter(item => !allowList.includes(item));

		// Regex defined in a string has to have escaped characters escaped
		// Value regex is space delimited meaning it will stop searching the value if a space is found
		// A sensitive value that contains a space will only be partially masked
		const valueRegex = '[\'"\\s]*[=:][\\s]*([\\S]+)[\\]\\["\'{}]?';
		const fieldRegex = `(?:${this.maskList.join('|')})`;
		this.maskRegex = new RegExp(`${fieldRegex}${valueRegex}`, 'ig');
	}

	/**
	 * Call log with type of `debug` with all the arguments given
	 * @returns {array}
	 */
	debug (...args) {
		return this.log('debug', ...args);
	}

	/**
	 * Call log with type of `info` with all the arguments given
	 * @returns {array}
	 */
	info (...args) {
		return this.log('info', ...args);
	}

	/**
	 * Call log with type of `warn` with all the arguments given
	 * @returns {array}
	 */
	warn (...args) {
		return this.log('warn', ...args);
	}

	/**
	 * Call log with type of `error` with all the arguments given
	 * @returns {array}
	 */
	error (...args) {
		return this.log('error', ...args);
	}

	/**
	 * Log method that masks messages before sending to the logger
	 * @param {string} type Level of message being raised
	 * @param  {array} messages Messages to be logged
	 * @returns {array}
	 */
	log (type, ...messages) {
		const maskedMessages = messages.map(message => this.mask(message));
		logger[type].apply(logger, maskedMessages);
		return maskedMessages;
	}

	/**
	 * Main masking method to identify the type of message and mask accordingly
	 * this method calls it's self recursively to process arrays
	 * @param {any} message A message of any type to mask
	 * @return {any} Message fully masked
	 */
	mask (message) {
		if (typeof message === 'string') {
			return this._maskString(message);
		} else if (Array.isArray(message)) {
			return message.map(item => this.mask(item));
		} else if (typeof message === 'object' && message !== null) {
			return this._maskObject(message);
		} else {
			return message;
		}
	}

	/**
	 * Replace all sensitive values found within the string
	 * @private
	 * @param {string} message String that may contain secrets
	 * @returns {string} Fully masked
	 */
	_maskString (message) {
		// Guess to see if string is stringified JSON and parse as object for better masking
		if (message.startsWith('{')) {
			try {
				const json = JSON.parse(message);
				if (json && typeof json === 'object') {
					return JSON.stringify(this.mask(json));
				}
			} catch (e) {}
		}

		// Capture group of the maskRegex should contain the sensitive value
		// replace this with the maskString to remove the sensitive information
		return message.replace(this.maskRegex, (match, captureGroup) => {
			return match.replace(captureGroup, this.maskString);
		});
	}

	/**
	 * Iterate over the object and mask if property is marked as sensitive
	 * @private
	 * @param {object} message Object to mask
	 * @returns {object} Fully masked
	 */
	_maskObject (message) {
		for (let key in message) {
			// If the key is sensitive mask the value entirely
			if (this.maskList.includes(key)) {
				message[key] = this.maskString;
			} else {
				// If the key is not sensitive run the mask on it's value
				message[key] = this.mask(message[key]);
			}
		}
		return message;
	}
}

module.exports = MaskLogger;
