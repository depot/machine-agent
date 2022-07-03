package api

import (
	"fmt"
	"os"
)

type Depot struct {
	BaseURL string
	token   string
}

func NewDepot(baseURL string, token string) *Depot {
	return &Depot{BaseURL: baseURL, token: token}
}

func NewDepotFromEnv(token string) (*Depot, error) {
	baseURL := os.Getenv("DEPOT_API_HOST")
	if baseURL == "" {
		baseURL = "https://depot.dev"
	}
	return NewDepot(baseURL, token), nil
}

type ExampleResponse struct {
	OK bool `json:"ok"`
}

func (d *Depot) Example(id string) error {
	_, err := apiRequest[ExampleResponse](
		"DELETE",
		fmt.Sprintf("%s/api/internal/example/%s", d.BaseURL, id),
		d.token,
		map[string]string{},
	)
	return err
}
