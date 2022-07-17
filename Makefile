.PHONY: bin/machine-agent
bin/machine-agent:
	go build -o $@ ./cmd/machine-agent

.PHONY: clean
clean:
	rm -rf ./bin
