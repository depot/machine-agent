package api

import (
	"fmt"
	"os"
)

type Depot struct {
	BaseURL string
	token   string
}

func New(baseURL string, token string) *Depot {
	return &Depot{BaseURL: baseURL, token: token}
}

func NewFromEnv(token string) *Depot {
	baseURL := os.Getenv("DEPOT_API_HOST")
	if baseURL == "" {
		baseURL = "https://depot.dev"
	}
	return New(baseURL, token)
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

type RegisterAwsBuilderRequest struct {
	Document  string `json:"document"`
	Signature string `json:"signature"`
	ASG       string `json:"asg"`
}

type RegisterAwsBuilderResponse struct {
	OK    bool   `json:"ok"`
	Token string `json:"token"`
	Role  string `json:"role"`
}

func (d *Depot) RegisterAwsBuilder(request RegisterAwsBuilderRequest) (*RegisterAwsBuilderResponse, error) {
	return apiRequest[RegisterAwsBuilderResponse](
		"POST",
		fmt.Sprintf("%s/api/internal/aws/builder/register", d.BaseURL),
		d.token,
		request,
	)
}
