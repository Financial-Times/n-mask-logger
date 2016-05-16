# TODO n.Makefile & nht

.PHONY: test

clean:
	git clean -fxd

install:
	@echo "Installing…"
	@npm install

verify:
	@echo "Verifying…"
	@find ./src ./test -type f -exec lintspaces -e .editorconfig -i js-comments {} + &&\
	eslint -c ./.eslintrc.js ./src ./test

unit-test:
	@echo "Unit Testing…"
	@mocha --require test/setup --recursive --reporter spec test

test: verify unit-test

build: $(shell find src -type f)
	@echo "Building…"
	@rm -rf build
	@babel -d build src
