package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"github.com/spf13/viper"
	"io"
	"log"
	"net/http"
)

/*
RequestBody is the request body for the OpenAI API
https://platform.openai.com/docs/api-reference/completions/create
*/
type RequestBody struct {
	Model    string `json:"model"`
	Messages []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"messages"`
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

/*
ResponseBody is the response body for the OpenAI API
https://platform.openai.com/docs/api-reference/completions/create
*/
type ResponseBody struct {
	Id      string `json:"id"`
	Object  string `json:"object"`
	Created int    `json:"created"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	}
}

// getConfig returns the value of a config variable
func getConfig(name string) string {
	// The config file is in the same directory as the executable
	viper.SetConfigFile("config.ini")
	err := viper.ReadInConfig()
	if err != nil {
		panic(err)
	}

	// Get config value
	return viper.GetString(name)
}

func main() {
	// Handle the chat endpoint
	http.HandleFunc("/v1/chat/completions", handleChat)

	port := getConfig("PORT")
	// Create a server and listen on port 3000
	server := &http.Server{
		Addr:      ":" + port,
		TLSConfig: &tls.Config{},
	}

	// Start the server
	log.Printf("Server listening on port %v", port)
	// Environment variables, You can use a self-signed certificate for testing
	log.Fatal(server.ListenAndServeTLS(getConfig("SSL_CERT_FILE"), getConfig("SSL_KEY_FILE")))
}

/*
handleChat handles the chat endpoint
This endpoint is used to send a request to the OpenAI API
and return the response to the client
The request and response body is the same as the OpenAI API
https://platform.openai.com/docs/api-reference/completions/create
*/
func handleChat(w http.ResponseWriter, r *http.Request) {
	// Set the gateway response headers for CORS
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

	// Decode the request body from client
	var requestBody RequestBody
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		log.Printf("Failed to decode request body: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Add your OpenAI API key
	apiKey := getConfig("OPENAI_API_KEY")

	// The OpenAI API
	url := getConfig("OPENAI_API")

	// Marshal the request body from client
	reqBody, err := json.Marshal(requestBody)
	if err != nil {
		log.Printf("Failed to marshal request body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Create a new HTTP request for gateway to send to the OpenAI API
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		log.Printf("Failed to create HTTP request: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Set the request headers for gateway to send to the OpenAI API
	req.Header.Set("Authorization", apiKey)
	req.Header.Set("Content-Type", "application/json")

	// Send the request from the gateway to the OpenAI API
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to send HTTP request: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	// Close the response body from the OpenAI API
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.Printf("Failed to close HTTP response body: %v", err)
		}
	}(resp.Body)

	// Read the response body from the OpenAI API
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read HTTP response body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Unmarshal the response body from the OpenAI API
	var responseBody ResponseBody
	err = json.Unmarshal(respBody, &responseBody)

	if err != nil {
		log.Printf("Failed to unmarshal HTTP response body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Marshal the response body from the OpenAI API
	jsonResponse, err := json.Marshal(responseBody)
	if err != nil {
		log.Printf("Failed to marshal HTTP response: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Send the response to the client with status code 200 OK (success)
	// and the response body from the OpenAI API as JSON
	// https://beta.openai.com/docs/api-reference/create-completion
	w.WriteHeader(http.StatusOK)
	if _, err := w.Write(jsonResponse); err != nil {
		log.Printf("Failed to write HTTP response: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}
