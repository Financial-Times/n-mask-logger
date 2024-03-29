> **Warning**
> 
> n-mask-logger has been deprecated as of **2023-04-17**. It will reach end-of-life on **2023-10-20** at which point no further security patches will be applied. The library will continue to work in currently-supported versions of Node.js but **it should not be used in new projects**. The recommended replacement is [Reliability Kit logger](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/logger#readme).
> 
> [Further information is available in this blog post](https://financialtimes.atlassian.net/l/cp/ZgynW1RP).

# n-mask-logger [![Circle CI](https://circleci.com/gh/Financial-Times/n-mask-logger.svg?style=svg)](https://circleci.com/gh/Financial-Times/n-mask-logger)

Wrapper for [n-logger](https://github.com/Financial-Times/n-logger) that masks sensitive fields

## Installation

    npm install @financial-times/n-mask-logger

## Usage

Import `n-mask-logger`, initialize it with an array of sensitive field names and use the new instance as you would [n-logger](https://github.com/Financial-Times/n-logger):

```javascript
import MaskLogger from '@financial-times/n-mask-logger';
const logger = new MaskLogger(ARRAY_OF_FIELD_NAMES_TO_MASK);
logger.info(...);
> 
```

Logging levels `info`, `warning`, `error` are supported.

### Logging Simple Objects
```javascript
const logger = new MaskLogger(['email', 'password']);

const user = {
	name: 'L. Ogger',
	age: 32,
	email: 'logger@ft.com',
	password: 'passw0rd',
	role: 'Developer'
}

logger.info(user);
```
Output:
```javascript
> {name:"L. Ogger",age:32,email:"*****",password:"*****",role:"Developer"}
```

### Logging Nested Objects
```javascript
const logger = new MaskLogger(['email', 'password']);
const deepObject = {
	foo: 'bar',
	inner: {
		some: 'field',
		deep: {
			password: 'passw0rd'
		},
		email: 'logger@ft.com'
	}
}
```
Output:
```javascript
> {foo:"bar",inner:{some:"field",deep:{password:"*****"},email:"*****"}}
```

### Logging Strings

Besides masking object fields `n-mask-logger` will attempt to mask strings that look like they may contain sensitive information.

#### Ordinary Strings
```javascript
const logger = new MaskLogger(['email', 'password']);

const innocuous = 'I am a safe string';
logger.info(innocuous);
```
Output:
```javascript
> I am a safe string
```

#### Suspicious Strings
If the string being logged contains any of the sensitive field names (i.e. password), the entire string is masked as a precaution.
```javascript
const logger = new MaskLogger(['email', 'password']);

const someVar = user.password;
const suspicious = `The user password is ${someVar}`;
logger.info(suspicious);
```
Output:
```javascript
> *****
```

#### Exceptions
Some level of vigilance is still required when using `n-mask-logger`, as the following would inevitably output a sensitive field in clear text:
```javascript
const logger = new MaskLogger(['email', 'password']);

const someVar = user.password;
const uncaught = `${someVar}`
logger.info(uncaught);
```
Output:
```javascript
> passw0rd
```
