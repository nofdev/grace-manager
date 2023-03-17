package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	// create a new gin router
	r := gin.Default()

	// serve the frontend HTML file
	r.GET("/", func(c *gin.Context) {
		http.ServeFile(c.Writer, c.Request, "index.html")
	})

	// start the gin server
	if err := http.ListenAndServe(":3000", r); err != nil {
		log.Fatal(err)
	}
}
