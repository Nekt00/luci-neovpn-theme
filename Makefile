VERSION ?= 1.0.0-rc2

.PHONY: build validate clean

build:
	./scripts/build-ipk.sh

validate:
	./scripts/validate.sh

release-check: build
	./scripts/release-check.sh

clean:
	rm -rf dist/*
	touch dist/.gitkeep
