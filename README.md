# n-mask-logger [![Circle CI](https://circleci.com/gh/Financial-Times/n-mask-logger.svg?style=svg)](https://circleci.com/gh/Financial-Times/n-mask-logger)

Wrapper for @financial-times/n-logger that masks sensitive fields

## Installation

    npm install @financial-times/n-mask-logger

## Usage Examples

Import `n-mask-logger`, initialize it with an array of sensitive field names, use the new instance as you would `@financial-times/n-logger`:

```javascript
import MaskLogger from '@financial-times/n-mask-logger';
const logger = new MaskLogger(ARRAY_OF_FIELD_NAMES_TO_MASK);
logger.info(...)
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
> {name:"L.Ogger",age:32,email:"*****",password:"*****",role:"Developer"}
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
logger.info(innocouous);
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

#### Logging Exceptions
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
