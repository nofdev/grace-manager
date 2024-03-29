package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/assert/v2"
)

// TestSendMessage tests the sendMessage function
func TestSendMessage(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/send", sendMessage)
	w := httptest.NewRecorder()
	body := strings.NewReader(`{"id":"1", "user":"John", "message":"Hello"}`)
	req, _ := http.NewRequest("POST", "/send", body)

	// Assertions
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, `{"id":"1","user":"John","message":"Hello"}`, w.Body.String())
}

// TestReceiveMessage tests the receiveMessage function
func TestReceiveMessage(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/receive", receiveMessage)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/receive", nil)

	// Assertions
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, `[{"id":"","user":"","message":""}]`, w.Body.String())
}
