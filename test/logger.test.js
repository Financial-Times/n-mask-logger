const expect = require('chai').expect;
const sandbox = require('sinon').createSandbox();
const proxyquire = require('proxyquire').noCallThru();
const nLoggerStub = {};
const SafeLogger = proxyquire('../src/main', {
	'@financial-times/n-logger': {
		default: nLoggerStub
	}
});

describe('MaskLogger', () => {
	let logger;
	const mask = '*****';
	const testEmail = 'example@example.com';
	const testPassword = 'testing123';

	beforeEach(() => {
		logger = new SafeLogger(['password', 'email']);
		sandbox.spy(logger, 'log');
		sandbox.spy(logger, 'mask');
		nLoggerStub.debug = sandbox.stub();
		nLoggerStub.info = sandbox.stub();
		nLoggerStub.warn = sandbox.stub();
		nLoggerStub.error = sandbox.stub();
	});

	afterEach(() => {
		sandbox.restore();
	});

	['debug', 'info', 'warn', 'error'].forEach(type => {
		describe(type, () => {
			it(`should call log with type ${type}`, () => {
				logger[type]('test');
				expect(logger.log.calledWith(type)).to.be.true;
			});

			it('should call log with all arguments', () => {
				logger[type]('test', [], {});
				expect(logger.log.getCall(0).args).to.eql([type, 'test', [], {}]);
			});
		});
	});

	describe('log', () => {
		it('should call mask on a message', () => {
			logger.log('info', 'message');
			expect(logger.mask.callCount).to.equal(1);
		});

		it('should call mask on every message', () => {
			logger.log('info', 'message1', 'message2', 'message3');
			expect(logger.mask.callCount).to.equal(3);
		});

		['debug', 'info', 'warn', 'error'].forEach(type => {
			it(`should send ${type} masked messages to n-logger`, () => {
				logger.log(type, 'message', `password=${testPassword}`, { email: testEmail });
				expect(nLoggerStub[type].getCall(0).args).to.eql([
					'message',
					`password=${mask}`,
					{ email: mask }
				]);
			});
		});

		it('should return the masked messages', () => {
			const messages = logger.log('info', 'message', `password=${testPassword}`, { email: testEmail });
			expect(messages).to.eql(['message', `password=${mask}`, { email: mask }]);
		});
	});

	describe('mask', () => {
		describe('values in strings', () => {
			[
				// Don't mask
				{ message: 'Plain string with an email and password', result: 'Plain string with an email and password' },
				{ message: '/email/within/url', result: '/email/within/url' },
				{ message: '/url/password/within', result: '/url/password/within' },

				// Bare values
				{ message: `email=${testEmail}`, result: `email=${mask}` },
				{ message: `email:${testEmail}`, result: `email:${mask}` },
				{ message: `email = ${testEmail}`, result: `email = ${mask}` },
				{ message: `email : ${testEmail}`, result: `email : ${mask}` },
				{ message: `email=${testEmail} password=${testPassword}`, result: `email=${mask} password=${mask}` },
				{ message: `email:${testEmail} password:${testPassword}`, result: `email:${mask} password:${mask}` },
				{ message: `email = ${testEmail} password = ${testPassword}`, result: `email = ${mask} password = ${mask}` },
				{ message: `email : ${testEmail} password : ${testPassword}`, result: `email : ${mask} password : ${mask}` },

				// Double quoted values
				{ message: `"email"="${testEmail}"`, result: `"email"=${mask}` },
				{ message: `"email":"${testEmail}"`, result: `"email":${mask}` },
				{ message: `"email" = "${testEmail}"`, result: `"email" = ${mask}` },
				{ message: `"email" : "${testEmail}"`, result: `"email" : ${mask}` },
				{ message: `"email"="${testEmail}" "password"="${testPassword}"`, result: `"email"=${mask} "password"=${mask}` },
				{ message: `"email":"${testEmail}" "password":"${testPassword}"`, result: `"email":${mask} "password":${mask}` },
				{ message: `"email" = "${testEmail}" "password" = "${testPassword}"`, result: `"email" = ${mask} "password" = ${mask}` },
				{ message: `"email" : "${testEmail}" "password" : "${testPassword}"`, result: `"email" : ${mask} "password" : ${mask}` },

				// Single quoted values
				{ message: `'email'='${testEmail}'`, result: `'email'=${mask}` },
				{ message: `'email':'${testEmail}'`, result: `'email':${mask}`},
				{ message: `'email' = '${testEmail}'`, result: `'email' = ${mask}` },
				{ message: `'email' : '${testEmail}'`, result: `'email' : ${mask}`},
				{ message: `'email'='${testEmail}' 'password'='${testPassword}'`, result: `'email'=${mask} 'password'=${mask}` },
				{ message: `'email':'${testEmail}' 'password':'${testPassword}'`, result: `'email':${mask} 'password':${mask}` },
				{ message: `'email' = '${testEmail}' 'password' = '${testPassword}'`, result: `'email' = ${mask} 'password' = ${mask}` },
				{ message: `'email' : '${testEmail}' 'password' : '${testPassword}'`, result: `'email' : ${mask} 'password' : ${mask}`},

				// JSON stringified values
				// *Note* Results will have white space removed as messages are parsed and stringified
				{ message: `{"email":"${testEmail}"}`, result: `{"email":"${mask}"}` },
				{ message: `{ "email" : "${testEmail}" }`, result: `{"email":"${mask}"}` },
				{ message: `{"email":"${testEmail}","password":"${testPassword}"}`, result: `{"email":"${mask}","password":"${mask}"}` },
				{ message: `{ "email" : "${testEmail}", "password" : "${testPassword}" }`, result: `{"email":"${mask}","password":"${mask}"}` },

			].forEach(({ message, result }) => {
				it(`should mask ${message}`, () => {
					expect(logger.mask(message)).to.eql(result);
				});
			});
		});

		describe('values in objects', () => {
			[
				// Single value
				{
					message: { email: testEmail },
					result: { email: mask }
				},
				// Single value nested
				{
					message: { nest: { email: testEmail } },
					result: { nest: { email: mask } }
				},
				// Single value deeply nested
				{
					message: { nest1: { nest2: { nest3: { email: testEmail } } } },
					result: { nest1: { nest2: { nest3: { email: mask } } } }
				},
				// Multiple values
				{
					message: { email: testEmail, password: testPassword },
					result: { email: mask, password: mask}
				},
				// Multiple values nested
				{
					message: { nest: { email: testEmail, password: testPassword } },
					result: { nest: { email: mask, password: mask} }
				},
				// Multiple values deeply nested
				{
					message: { nest1: { nest2: { nest3: { email: testEmail, password: testPassword } } } },
					result: { nest1: { nest2: { nest3: { email: mask, password: mask } } } }
				},
				// Multiple values nested differently
				{
					message: { nest1: { nest2: { email: testEmail, nest3: { password: testPassword } } } },
					result: { nest1: { nest2: { email: mask, nest3: { password: mask } } } }
				}
			].forEach(({ message, result }) => {
				it(`should mask ${JSON.stringify(message)}`, () => {
					expect(logger.mask(message)).to.eql(result);
				});
			});
		});

		describe('values in arrays', () => {
			[
				// Single string
				{
					message: [ `email=${testEmail}` ],
					result: [ `email=${mask}`]
				},
				// Multiple strings
				{
					message: [ `email=${testEmail}`, `password=${testPassword}` ],
					result: [ `email=${mask}`, `password=${mask}` ]
				},
				// Single object
				{
					message: [ { email: testEmail } ],
					result: [ { email: mask } ]
				},
				// Multiple objects
				{
					message: [ { email: testEmail }, { password: testPassword } ],
					result: [ { email: mask }, { password: mask } ]
				},
				// Mixture
				{
					message: [ { email: testEmail }, `password=${testPassword}` ],
					result: [ { email: mask }, `password=${mask}` ]
				}
			].forEach(({ message, result }) => {
				it(`should mask ${JSON.stringify(message)}`, () => {
					expect(logger.mask(message)).to.eql(result);
				});
			});
		});
	});
});
