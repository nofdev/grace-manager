package worker

import (
	"log"

	"github.com/googollee/go-socket.io"
)

func Client() {

	// Create new client instance
	opts := &socketio.ClientOptions{
		Transport: "websocket",
	}
	c, err := socketio.NewClient("http://localhost:8000/socket.io/", opts)
	if err != nil {
		log.Fatal(err)
	}
	defer c.Close()

	// When client connected, print the message
	c.On("connect", func() {
		log.Println("connected to server")
	})

	// When client disconnected, print the message
	c.On("event", func(msg string) {
		log.Println("received event:", msg)
	})

	// Send message to server
	err = c.Emit("send", "messages")
	if err != nil {
		log.Fatal(err)
	}

	select {}
}
