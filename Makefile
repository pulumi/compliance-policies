.PHONY: lint

lint::
	@yarn run lint

stats::
	@/bin/sh -c 'for x in vendor-*; do echo -n "$$x: " && cd $$x && make --quiet stats && cd ..; done'