module.exports = {
	files: {
		allow: [],
		allowOverrides: []
	},
	strings: {
		deny: [],
		denyOverrides: [
			'example@example\\.com' // test/logger.test.js:14
		]
	}
};
