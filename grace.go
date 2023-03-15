package main

import (
	socketio "github.com/googollee/go-socket.io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/nofdev/grace-manager/worker"
)

type chat struct {
	Id      string `json:"id"`
	User    string `json:"user"`
	Message string `json:"message"`
}

// chats is a slice of chat struct to store all the chat messages
// TODO: Replace this with a database
var chats = []chat{
	{Id: "", User: "", Message: ""},
}

// sendMessage is a handler function which creates a new chat message
func sendMessage(c *gin.Context) {
	var newChat chat
	if err := c.BindJSON(&newChat); err != nil {
		return
	}
	chats = append(chats, newChat)
	c.JSON(http.StatusOK, newChat)
}

var socketClient socketio.Client

// sendMessageWithSocketIO is a handler function which creates a new chat message
func sendMessageWithSocketIO(c *gin.Context) {
	var newChat chat
	if err := c.BindJSON(&newChat); err != nil {
		return
	}
	chats = append(chats, newChat)
	c.JSON(http.StatusOK, newChat)

	// Emit the message to the socket.io server
	if socketClient == nil {
		var err error
		socketClient, err = socketio.Dial("http://localhost:8000/socket.io/", nil)
		if err != nil {
			log.Fatal(err)
		}
	}
}

// sendMessageByID locates the chat message whose ID value matches the id
// parameter sent by the client, then updates the message field of that chat message.
func sendMessageByID(c *gin.Context) {
	id := c.Param("id")
	var updateChat chat
	if err := c.BindJSON(&updateChat); err != nil {
		return
	}
	for i, a := range chats {
		if a.Id == id {
			chats[i].Message = updateChat.Message
			c.JSON(http.StatusOK, chats[i])
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"message": "chat not found"})
}

// receiveMessage is a handler function which returns all chat messages
func receiveMessage(c *gin.Context) {
	c.JSON(http.StatusOK, chats)
}

// receiveMessageByID locates the chat message whose ID value matches the id
// parameter sent by the client, then returns that chat message as a response.
func receiveMessageByID(c *gin.Context) {
	id := c.Param("id")

	// Loop over the list of chats, looking for a chat whose ID value matches the parameter.
	for _, a := range chats {
		if a.Id == id {
			c.JSON(http.StatusOK, a)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"message": "chat not found"})
}

// main function to boot up everything
func main() {
	router := gin.Default()

	// Serve frontend static files
	router.Static("/chat", "./frontend")

	// API group routes for versioning and future expansion of API endpoints
	// TODO: Add authentication middleware and OAuth2
	v1 := router.Group("/v1")
	v1.POST("/send", sendMessage)
	v1.PUT("/send/:id", sendMessageByID)
	v1.GET("/receive", receiveMessage)
	v1.GET("/receive/:id", receiveMessageByID)

	err := router.Run(":8080")

	if err != nil {
		return
	}
}
