package api

import (
	"fmt"
	"os"
)

type Depot struct {
	BaseURL      string
	connectionID string
	token        string
}

func New(baseURL string, connectionID string, token string) *Depot {
	return &Depot{BaseURL: baseURL, connectionID: connectionID, token: token}
}

func NewFromEnv(token string) *Depot {
	baseURL := os.Getenv("DEPOT_CLOUD_API_HOST")
	if baseURL == "" {
		baseURL = "https://cloud.depot.dev"
	}
	connectionID := os.Getenv("DEPOT_CLOUD_CONNECTION_ID")
	return New(baseURL, connectionID, token)
}

type RegisterMachineRequest struct {
	Cloud     string `json:"cloud"`
	Document  string `json:"document"`
	Signature string `json:"signature"`
}

type RegisterMachineResponse struct {
	OK     bool    `json:"ok"`
	ID     string  `json:"id"`
	Kind   string  `json:"kind"`
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
		fmt.Sprintf("%s/connections/%s/register-machine", d.BaseURL, d.connectionID),
		d.token,
		request,
	)
}

type ReportHealthResponse struct {
	OK              bool   `json:"ok"`
	ID              string `json:"id"`
	Realm           string `json:"realm"`
	Kind            string `json:"kind"`
	Architecture    string `json:"architecture"`
	Ephemeral       bool   `json:"ephemeral"`
	ShouldTerminate bool   `json:"shouldTerminate"`
}

func (d *Depot) ReportHealth(machineID string) (*ReportHealthResponse, error) {
	return apiRequest[ReportHealthResponse](
		"GET",
		fmt.Sprintf("%s/machines/%s", d.BaseURL, machineID),
		d.token,
		nil,
	)
}
