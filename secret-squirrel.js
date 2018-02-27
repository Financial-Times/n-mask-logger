module.exports = {
	files: {
		allow: [],
		allowOverrides: []
	},
	strings: {
		deny: [],
		denyOverrides: [
			'test@mail\\.com' // test/logger.test.js:147|152|157
		]
	}
};
