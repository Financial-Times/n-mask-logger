include n.Makefile

unit-test:
	@echo "Unit Testing…"
	@./node_modules/.bin/mocha --require test/setup --recursive --reporter spec test

test: verify unit-test

build: $(shell find src -type f)
	@echo "Building…"
	@rm -rf build
	@./node_modules/.bin/babel -d build src
