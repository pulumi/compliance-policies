.PHONY: lint

lint::
	@yarn run lint

stats::
	@/bin/sh -c 'for x in vendor-*; do echo "\e[38;2;255;114;127m$$x:\e[0m " && cd $$x && make --quiet stats && cd ..; done'