// Description: Sample code for creating a gateway server to access OpenAI API from a browser.
// This code is not meant to be used in production.
// This code is meant to be used as a starting point for creating a gateway server for your own use.
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {

	// Read OpenAI API Key from file
	apiKey, err := os.ReadFile("openai_api_key.txt")
	if err != nil {
		log.Fatal(err)
	}
	apiKey = []byte(strings.ReplaceAll(string(apiKey), "\n", ""))

	// Create HTTP client
	client := &http.Client{}

	// Define handler function
	handler := func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Send OpenAI API Request
		url := fmt.Sprintf("https://api.openai.com/%s", r.URL.Path[1:])
		req, err := http.NewRequest(r.Method, url, r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		req.Header.Set("Content-Type", r.Header.Get("Content-Type"))
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

		resp, err := client.Do(req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// Make sure the response body is always closed before the function exits.
		// If an error occurs while closing the response body, it will be logged instead of crashing the program.
		defer func() {
			if err := resp.Body.Close(); err != nil {
				log.Printf("Failed to close HTTP response body: %v", err)
			}
		}()

		// Set response headers
		w.Header().Set("Transfer-Encoding", "chunked")
		w.WriteHeader(resp.StatusCode)

		// Write response to client form OpenAI API using stream
		defer resp.Body.Close()
		buf := make([]byte, 1024)
		for {
			n, err := resp.Body.Read(buf)
			if n > 0 {
				if _, err := w.Write(buf[:n]); err != nil {
					return
				}
				w.(http.Flusher).Flush()
			}
			if err != nil {
				if err != io.EOF {
					http.Error(w, err.Error(), http.StatusInternalServerError)
				}
				break
			}
		}
	}

	// Create HTTP server
	server := &http.Server{
		Addr:    ":8080",
		Handler: http.HandlerFunc(handler),
	}

	// Start HTTP server
	log.Printf("Starting server on port %s", server.Addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
