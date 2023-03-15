package main

import (
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

func main() {
	// Create proxy instance and setting target address
	targetURL, _ := url.Parse("http://localhost:8080")
	proxy := httputil.NewSingleHostReverseProxy(targetURL)

	// Create Gin instance
	router := gin.Default()

	// Define reverse proxy middleware
	reverseProxyHandler := func(c *gin.Context) {
		proxy.ServeHTTP(c.Writer, c.Request)
	}

	// Define route rule, all requests are proxy to reverse proxy middleware
	router.NoRoute(reverseProxyHandler)

	// Start HTTP server
	if err := router.Run(":8000"); err != nil {
		panic(err)
	}
}
