.PHONY: bin/builder-agent
bin/builder-agent:
	go build -o $@ ./cmd/builder-agent

.PHONY: clean
clean:
	rm -rf ./bin
