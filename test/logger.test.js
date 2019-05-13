import chai from 'chai';
chai.should();

import SafeLogger from '../src/main';
import { AnotherError } from './utils/error';

describe('Logger', () => {

	let logger;
	beforeEach(() => {
		logger = new SafeLogger(['password', 'email']);
	});

	context('GENERAL', () => {

		it('Should warn', () => {
			// TODO check the log type
			const message = logger.warn('something');
			message.should.eql(['something']);
		});

		it('Should debug', () => {
			// TODO check the log type
			const message = logger.debug('something');
			message.should.eql(['something']);
		});

		it('Should error', () => {
			// TODO check the log type
			const message = logger.error('something');
			message.should.eql(['something']);
		});

		it('Should log null', () => {
			const message = logger.info(null);
			message.should.eql([null]);
		});

		it('Should log mix of strings and objects', () => {
			const message = logger.info('an email else', { other: { password: 'passw0rd' } });
			message.should.eql(['an ***** else', { other: { password: '*****' } }]);
		});

		it('Should mask VALUE of sensitive KEY in Error', () => {
			const error = new Error('Something went wrong');
			const error2 = new Error('this wont be logged email');
			const message = logger.info({
				something: 'safe',
				password: 'should not log this'
			}, error, error2);
			message.should.eql([{
				something: 'safe',
				password: '*****'
			},{
				error_message: error.message,
				error_name: error.name,
				error_stack: error.stack
			},{
				error_message: '*****',
				error_name: 'Error',
				error_stack: '*****'
			}]);
		});

		it('Should mask VALUE of sensitive KEY in *nested* Error', () => {
			const error = new Error('Something went wrong');
			const message = logger.info({
				something: 'safe',
				password: 'should not log this',
				data: error
			});
			message.should.eql([{
				something: 'safe',
				password: '*****',
				data: {
					error_message: error.message,
					error_name: error.name,
					error_stack: error.stack
				}
			}]);
		});

	});

	context('OBJECT', () => {

		it('Should log an empty object', () => {
			const message = logger.info({ });
			message.should.eql([{ }]);
		});

		it('Should mask VALUE of sensitive KEY', () => {
			const message = logger.info({
				something: 'safe',
				password: 'should not log this'
			});
			message.should.eql([{
				something: 'safe',
				password: '*****'
			}]);
		});

		it('Should mask VALUE of sensitive KEY n-levels deep', () => {
			const message = logger.info({
				something: 'safe',
				other: {
					filler: 'filler',
					object: {
						anotherObject: {
							password: 'should not log this'
						},
						dummy: 'dummy'
					}
				}
			});
			message.should.eql([{
				something: 'safe',
				other: {
					filler: 'filler',
					object: {
						anotherObject: {
							password: '*****'
						},
						dummy: 'dummy'
					}
				}
			}]);
		});

		it('Should mask full VALUE if VALUE contains sensitive word', () => {
			const message = logger.info({
				something: 'safe',
				other: {
					filler: 'filler',
					object: {
						anotherObject: {
							maskThis: 'has sensitive word password in it'
						},
						dummy: 'dummy'
					}
				}
			});
			message.should.eql([{
				something: 'safe',
				other: {
					filler: 'filler',
					object: {
						anotherObject: {
							maskThis: '*****'
						},
						dummy: 'dummy'
					}
				}
			}]);
		});

	});

	context('STRING', () => {

		it('Should log empty string', () => {
			const message = logger.info('');
			message.should.eql(['']);
		});

		it('Should match n-logger output if safe', () => {
			const message = logger.info('something safe');
			message.should.eql(['something safe']);
		});

		it('should intelligently mask quoted values if possible', () => {
			const message = logger.info('email="test@mail.com" user="anything" password="test"');
			message.should.eql(['email="*****" user="anything" password="*****"']);
		});

		it('should intelligently mask unquoted if possible', () => {
			const message = logger.info('email=test@mail.com user=anything password=test');
			message.should.eql(['email="*****" user=anything password="*****"']);
		});

		it('should intelligently mask spaced values if possible', () => {
			const message = logger.info('email =   "test@mail.com" user="anything" password     = "test"');
			message.should.eql(['email="*****" user="anything" password="*****"']);
		});

		it('should intelligently mask escaped values if possible', () => {
			const message = logger.info('email=\"test@mail.com\" user=\"anything\" password=\"test\"');
			message.should.eql(['email="*****" user="anything" password="*****"']);
		});

		it('should still mask plain key occurrences', () => {
			const message = logger.info('email=test@mail.com user="anything" and this mentions a password!');
			message.should.eql(['email="*****" user="anything" and this mentions a *****!']);
		});

	});

	context('ERROR INSTANCE', () => {

		it('returns logger response with masked sensitive data', () => {
			const data = {
				responseData: {
					errorMessage: 'Password field is not defined'
				},
				requestData: {
					rememberMe: true,
					email: 'email'
				}
			};
			const error = new AnotherError('Something went wrong', data);
			const loggerResponse = logger.error('Missing fields', error);
			loggerResponse.should.eql([
				'Missing fields',
				{
					error_data: {
						requestData: {
							rememberMe: true,
							email: '*****'
						},
						responseData: {
							errorMessage: '*****'
						}
					},
					error_message: 'Something went wrong',
					error_name: 'Error',
					error_stack:  error.stack
				}
			]);
		});

	});

});
