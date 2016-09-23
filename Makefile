# TODO n.Makefile & nht

.PHONY: test

clean:
	git clean -fxd

install:
	@echo "Installing…"
	@npm install

verify:
	@echo "Verifying…"
	@find ./src ./test -type f -exec ./node_modules/.bin/lintspaces -e .editorconfig -i js-comments {} + &&\
	./node_modules/.bin/eslint -c ./.eslintrc.js ./src ./test

unit-test:
	@echo "Unit Testing…"
	@./node_modules/.bin/mocha --require test/setup --recursive --reporter spec test

test: verify unit-test

build: $(shell find src -type f)
	@echo "Building…"
	@rm -rf build
	@./node_modules/.bin/babel -d build src
