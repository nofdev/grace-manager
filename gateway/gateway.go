package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

// RequestBody is the request body for the OpenAI API
type RequestBody struct {
	Model            string    `json:"model"`
	Messages         []string  `json:"messages"`
	Temperature      float64   `json:"temperature"`
	TopP             float64   `json:"top_p"`
	N                int       `json:"n"`
	Stream           bool      `json:"stream"`
	Stop             []string  `json:"stop"`
	MaxTokens        int       `json:"max_tokens"`
	PresencePenalty  float64   `json:"presence_penalty"`
	FrequencyPenalty float64   `json:"frequency_penalty"`
	LogitBias        []float64 `json:"logit_bias"`
	User             string    `json:"user"`
}

// ResponseBody is the response body for the OpenAI API
type ResponseBody struct {
	Choices []struct {
		Text string `json:"text"`
	} `json:"choices"`
}

func main() {
	// Handle the chat endpoint
	http.HandleFunc("/chat", handleChat)

	port := "3000"
	// Create a server and listen on port 3000
	server := &http.Server{
		Addr:      ":" + port,
		TLSConfig: &tls.Config{},
	}

	// Start the server
	log.Printf("Server listening on port %v", port)
	// Environment variables, You can use a self-signed certificate for testing
	log.Fatal(server.ListenAndServeTLS(os.Getenv("CERT_FILE"), os.Getenv("KEY_FILE")))
}

// handleChat handles the chat endpoint
// This endpoint is used to send a request to the OpenAI API
// and return the response to the client
// The request and response body is the same as the OpenAI API
// https://beta.openai.com/docs/api-reference/create-completion
func handleChat(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Handle preflight requests
	// https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only allow POST requests
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	// Decode the request body
	var requestBody RequestBody
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		log.Printf("Failed to decode request body: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Add your OpenAI API key
	apiKey := os.Getenv("OPENAI_API_KEY")

	// The OpenAI API
	url := "https://api.openai.com/v1/chat/completions"

	// Marshal the request body
	reqBody, err := json.Marshal(requestBody)
	if err != nil {
		log.Printf("Failed to marshal request body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Create a new HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		log.Printf("Failed to create HTTP request: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Set the headers
	req.Header.Set("Authorization", apiKey)
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to send HTTP request: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read the response body
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read HTTP response body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Unmarshal the response body
	var responseBody ResponseBody
	err = json.Unmarshal(respBody, &responseBody)

	if err != nil {
		log.Printf("Failed to unmarshal HTTP response body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Marshal the response body
	jsonResponse, err := json.Marshal(responseBody)
	if err != nil {
		log.Printf("Failed to marshal HTTP response: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)

}
