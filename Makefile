JSLINT     := node_modules/.bin/eslint --fix
TAP        := node_modules/.bin/faucet
ISTANBUL   := node_modules/.bin/istanbul

JS_SRC := cli.js docblox2md.js
JS_ALL := $(JS_SRC) $(wildcard test/*.js)

help:
	echo "Try one of: clean, lint, test"

clean:
	rm -fr coverage

lint:
	$(JSLINT) $(JS_ALL)

test:
	$(ISTANBUL) cover --print none --report lcov -x test.js test.js  |$(TAP)
	$(ISTANBUL) report text-summary

.PHONY: help clean lint test travis

.SILENT:	help test travis
