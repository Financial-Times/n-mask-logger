node_modules/@financial-times/n-gage/index.mk:
	npm install --no-save --no-package-lock @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

test: verify

unit-test:
	@echo "Unit Testing…"
	@./node_modules/.bin/mocha --require test/setup --recursive --reporter spec test

test: verify unit-test
