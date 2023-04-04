package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
)

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

type ResponseBody struct {
	Choices []struct {
		Text string `json:"text"`
	} `json:"choices"`
}

func main() {
	http.HandleFunc("/chat", handleChat)

	port := "3000"
	server := &http.Server{
		Addr:      ":" + port,
		TLSConfig: &tls.Config{},
	}

	log.Printf("Server listening on port %v", port)
	log.Fatal(server.ListenAndServeTLS("YOUR_CERT.cert", "/root/cert/YOUR_KEY.key"))
}

func handleChat(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var requestBody RequestBody
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		log.Printf("Failed to decode request body: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Add your OpenAI API key
	apiKey := "YOUR_API_KEY_HERE"

	url := "https://api.openai.com/v1/chat/completions"
	reqBody, err := json.Marshal(requestBody)
	if err != nil {
		log.Printf("Failed to marshal request body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		log.Printf("Failed to create HTTP request: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	req.Header.Set("Authorization", apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to send HTTP request: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read HTTP response body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var responseBody ResponseBody
	err = json.Unmarshal(respBody, &responseBody)

	if err != nil {
		log.Printf("Failed to unmarshal HTTP response body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	jsonResponse, err := json.Marshal(responseBody)
	if err != nil {
		log.Printf("Failed to marshal HTTP response: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)

}
