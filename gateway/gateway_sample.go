// Description: Sample code for creating a gateway server to access OpenAI API from a browser.
// This code is not meant to be used in production.
// This code is meant to be used as a starting point for creating a gateway server for your own use.
package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

func main() {

	// Read OpenAI API Key from file
	apiKey, err := os.ReadFile("openai_api_key.txt")
	if err != nil {
		log.Fatal(err)
	}

	// Create HTTP client
	client := &http.Client{}

	// Define handler function
	handler := func(w http.ResponseWriter, r *http.Request) {
		// Create a buffer to read the request body into it from the client request
		bodyBuffer := new(bytes.Buffer)
		_, err := io.Copy(bodyBuffer, r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		req, err := http.NewRequest(r.Method, fmt.Sprintf("https://api.openai.com/v1/%s", r.URL.Path[1:]), bodyBuffer)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		req.Header.Set("Content-Type", r.Header.Get("Content-Type"))
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

		// Send OpenAI API Request
		resp, err := client.Do(req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		// Write response to client form OpenAI API
		w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
		w.WriteHeader(resp.StatusCode)
		if _, err := io.Copy(w, resp.Body); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Create HTTP server
	http.HandleFunc("/", handler)

	// Start HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Starting server on port %s", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), nil); err != nil {
		log.Fatal(err)
	}
}
