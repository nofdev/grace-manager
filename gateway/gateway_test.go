package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestHandleChat tests the handleChat function
// It creates a test request and response recorder and calls the handleChat function
// It then checks the status code and content type of the response
// It also checks the id of the response body
// This test is not complete, it only checks the status code and content type of the response
// It does not check the response body
func TestHandleChat(t *testing.T) {
	// Create a test request body
	requestBody := &RequestBody{
		Model: "gpt-3.5-turbo",
		Messages: []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		}{
			{Role: "user", Content: "Hello!"},
			{Role: "user", Content: "World!"},
		},
		Temperature: 0.5,
		MaxTokens:   50,
	}

	// Marshal the request body
	reqBody, err := json.Marshal(requestBody)
	if err != nil {
		t.Fatalf("Failed to marshal request body: %v", err)
	}

	// Create a new request with the test body
	req, err := http.NewRequest("POST", "/chat", bytes.NewBuffer(reqBody))
	if err != nil {
		t.Fatalf("Failed to create test request: %v", err)
	}

	// Create a new test response recorder
	rr := httptest.NewRecorder()

	// Call the handleChat function with the test request and response recorder
	handleChat(rr, req)

	// Check the status code of the response
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handleChat returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check the content type of the response
	expectedContentType := "application/json"
	if contentType := rr.Header().Get("Content-Type"); contentType != expectedContentType {
		t.Errorf("handleChat returned wrong content type: got %v want %v", contentType, expectedContentType)
	}

	// Decode the response body
	var responseBody ResponseBody
	err = json.NewDecoder(rr.Body).Decode(&responseBody)
	if err != nil {
		t.Fatalf("Failed to decode response body: %v", err)
	}

	// Check the response body
	expectedId := "test-id"
	if responseBody.Id != expectedId {
		t.Errorf("handleChat returned wrong id: got %v want %v", responseBody.Id, expectedId)
	}
}
