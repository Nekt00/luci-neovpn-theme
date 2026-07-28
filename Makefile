VERSION ?= 1.0.0-rc4

.PHONY: build validate release-check clean

build:
	./scripts/build-apk.sh

validate:
	./scripts/validate.sh

release-check: build
	./scripts/release-check.sh

clean:
	rm -rf dist/*
	touch dist/.gitkeep
