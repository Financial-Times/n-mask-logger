// import sinon from 'sinon';
import chai from 'chai';
const expect = chai.expect;
chai.should();
import SafeLogger from '../src/main';

describe('Logger', () => {

	describe('Logging', () => {

		let logger;

		beforeEach(() => {
			logger = new SafeLogger(['password', 'email'])
		});

		it('STRING: Should log an empty object', () => {
			const message = logger.info({});
			message.should.equal('{}');
		});

		it('OBJECT: Should mask VALUE of sensitive KEY', () => {
			const message = logger.info({
				something: 'safe',
				password: 'should not log this'
			});
			expect(message.indexOf('*****')).to.not.equal(-1);
			expect(message.indexOf('should not log this')).to.equal(-1);
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
			expect(message.indexOf('*****')).to.not.equal(-1);
			expect(message.indexOf('should not log this')).to.equal(-1);
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
			expect(message.indexOf('*****')).to.not.equal(-1);
			expect(message.indexOf('password')).to.equal(-1);
		});


		it('STRING: Should log empty string', () => {
			const message = logger.info('');
			message.should.equal('');
		});

		it('STRING: Should match n-logger output if safe', () => {
			const message = logger.info('something safe');
			message.should.equal('something safe');
		});

		it('STRING: Should mask all output if sensitive string detected', () => {
			const message = logger.info('I have the sensitive word password in me. Mask me just in case!');
			message.should.equal('*****');
		});

		it('STRING: Should mask full VALUE if KEY is sensitive word', () => {
			const message = logger.info('Mostly safe but contains the word password. This should be masked.');
			message.should.equal('*****');
		});

		it('STRING: Should warn', () => {
			// TODO check the log type
			const message = logger.warn('something');
			message.should.equal('something');
		});

		it('STRING: Should error', () => {
			// TODO check the log type
			const message = logger.error('something');
			message.should.equal('something');
		});

		it('EMPTY: Should log null', () => {
			const message = logger.info(null);
			JSON.stringify(message).should.equal('"null"');
		});

		it('MULTI: Should log multiple strings', () => {
			const message = logger.info('something', 'other', 'that');
			message.should.equal('something other that');
		});

		it('MULTI: Should log mix of strings and objects', () => {
			const message = logger.info('something', {other: {this:'that'}}, null, 'something else');
			message.should.equal('something {"other":{"this":"that"}} null something else');
		});

	})
});
