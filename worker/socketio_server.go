package worker

import (
	"fmt"
	"github.com/googollee/go-socket.io"
	"log"
	"net/http"
)

func Server() {
	// Create a new server instance
	server := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}

	// When client connected, print the message
	server.OnConnect("/", func(s socketio.Conn) error {
		fmt.Println("client connected")
		return nil
	})

	// When client disconnected, print the message
	server.OnEvent("/", "message", func(s socketio.Conn, msg string) {
		fmt.Println("received message:", msg)
		s.Emit("response", "received message: "+msg)
	})

	// Register the socket.io server to /socket.io/ route of http server
	http.Handle("/socket.io/", server)
	http.Handle("/", http.FileServer(http.Dir("./public")))

	// Start the http server
	log.Fatal(http.ListenAndServe(":8000", nil))
}
