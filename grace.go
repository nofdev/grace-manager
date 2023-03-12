package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type chat struct {
	Id string `json:"id"`
	User string `json:"user"`
	Message string `json:"message"`
}

// chats is a slice of chat struct to store all the chat messages
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

// recieveMessage is a handler function which returns all chat messages
func recieveMessage(c *gin.Context) {
	c.JSON(http.StatusOK, chats)
}

// recieveMessage by ID locates the chat message whose ID value matches the id
// parameter sent by the client, then returns that chat message as a response.
func recieveMessageByID(c *gin.Context) {
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
	router.POST("/send", sendMessage)
	router.GET("/recieve", recieveMessage)
	router.GET("/recieve/:id", recieveMessageByID)
	router.Run(":8080")
}