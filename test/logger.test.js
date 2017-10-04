import chai from 'chai';
chai.should();

import SafeLogger from '../src/main';

describe('Logger', () => {

	describe('Logging', () => {

		let logger;

		beforeEach(() => {
			logger = new SafeLogger(['password', 'email'])
		});

		it('STRING: Should log an empty object', () => {
			const message = logger.info({ });
			message.should.eql([{ }]);
		});

		it('OBJECT: Should mask VALUE of sensitive KEY', () => {
			const message = logger.info({
				something: 'safe',
				password: 'should not log this'
			});
			message.should.eql([{
				something: 'safe',
				password: '*****'
			}]);
		});

		it('OBJECT: Should mask VALUE of sensitive KEY n-levels deep', () => {
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

		it('OBJECT: Should mask full VALUE if VALUE contains sensitive word', () => {
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


		it('STRING: Should log empty string', () => {
			const message = logger.info('');
			message.should.eql(['']);
		});

		it('STRING: Should match n-logger output if safe', () => {
			const message = logger.info('something safe');
			message.should.eql(['something safe']);
		});

		it('STRING: Should mask all output if sensitive string detected', () => {
			const message = logger.info('I have the sensitive word password in me. Mask me just in case!');
			message.should.eql(['*****']);
		});

		it('STRING: Should mask full VALUE if KEY is sensitive word', () => {
			const message = logger.info('Mostly safe but contains the word password. This should be masked.');
			message.should.eql(['*****']);
		});

		it('STRING: Should warn', () => {
			// TODO check the log type
			const message = logger.warn('something');
			message.should.eql(['something']);
		});

		it('STRING: Should error', () => {
			// TODO check the log type
			const message = logger.error('something');
			message.should.eql(['something']);
		});

		it('EMPTY: Should log null', () => {
			const message = logger.info(null);
			message.should.eql([null]);
		});

		it('MULTI: Should log mix of strings and objects', () => {
			const message = logger.info('an email else', { other: { password: 'passw0rd' } });
			message.should.eql(['*****', { other: { password: '*****' } }]);
		});

		it('ERROR: Should mask VALUE of sensitive KEY in error', () => {
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

	})
});
