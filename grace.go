package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
)

func main() {
	// Create gin router
	router := gin.Default()

	// Static file server and set index.html as default file
	router.StaticFile("/", "./frontend/index.html")

	// Create socket.io server
	server := socketio.NewServer(nil)

	// Handle socket connection event
	server.OnConnect("/", func(s socketio.Conn) error {
		fmt.Println("new connection")
		// Handle socket custom event
		server.OnEvent("/", "event", func(s socketio.Conn, msg string) {
			fmt.Println("event:", msg)
			// Broadcast to all clients
			server.BroadcastToNamespace("/", "event", msg)
		})

		// Handle socket disconnect event
		server.OnDisconnect("/", func(s socketio.Conn, reason string) {
			fmt.Println("disconnected:", reason)
		})
		return nil
	})

	// Wrap socket.io server with gin
	router.GET("/socket.io/*any", gin.WrapH(server))
	router.POST("/socket.io/*any", gin.WrapH(server))

	// Start gin server
	err := router.Run(":3000")
	if err != nil {
		return
	}

}
