SRC = $(shell find src -name "*.js" -type f | sort)
DEST = $(SRC:src/%.js=dist/%.js)

dist/%.js: src/%.js
	@mkdir -p $(@D)
	./_make/umdify $< > $@

dist: $(DEST)
	cp README.md dist/
	cp MIT-LICENSE.txt dist/
	cp package.json dist/

clean:
	rm -Rf dist/

publish: clean dist
	cd dist; npm publish

.PHONY: all dist clean publish
