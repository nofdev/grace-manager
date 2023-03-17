package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
)

func main() {
	// create a new gin router
	r := gin.Default()

	// create a new socket.io server
	server := socketio.NewServer(nil)

	// define socket.io events
	server.OnConnect("/", func(s socketio.Conn) error {
		log.Println("client connected:", s.ID())
		s.Join("chat")
		return nil
	})

	server.OnEvent("/", "chat message", func(s socketio.Conn, msg string) {
		log.Println("chat message:", msg)
		server.BroadcastToRoom("/", "chat", "chat message", msg)
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		log.Println("client disconnected:", s.ID())
	})

	// register socket.io server on the gin router
	r.GET("/socket.io/*any", gin.WrapH(server))
	r.POST("/socket.io/*any", gin.WrapH(server))

	// start the gin server
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}
