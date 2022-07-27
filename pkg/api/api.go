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

type RegisterMachineRequest struct {
	Cloud     string `json:"cloud"`
	Document  string `json:"document"`
	Signature string `json:"signature"`
}

type RegisterMachineResponse struct {
	OK     bool    `json:"ok"`
	Role   string  `json:"role"`
	Mounts []Mount `json:"mounts"`
	Token  string  `json:"token,omitempty"`
	CaCert string  `json:"caCert,omitempty"`
	Cert   string  `json:"cert,omitempty"`
	Key    string  `json:"key,omitempty"`
}

type Mount struct {
	Path   string `json:"path"`
	Device string `json:"device"`
}

func (d *Depot) RegisterMachine(request RegisterMachineRequest) (*RegisterMachineResponse, error) {
	return apiRequest[RegisterMachineResponse](
		"POST",
		fmt.Sprintf("%s/api/agents/machine/register", d.BaseURL),
		d.token,
		request,
	)
}
