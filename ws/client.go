package ws

import (
	"encoding/json"
	"log"
	"realTimeForum/utils"
	"time"

	// "realTimeForum/utils"
	"github.com/gorilla/websocket"
)

type Client struct {
	Conn     *websocket.Conn
	Message  chan *Message
	ID       string `json:"id"`
	RoomID   string `json:"roomId"`
	Username string `json:"username"`
}

type Message struct {
	Content     string `json:"content"`
	RoomID      string `json:"roomId"`
	Username    string `json:"username"`
	SenderID    string `json:"senderId"`
	RecipientID string `json:"recipientId"`
	Action      string `json:"action"`
	TimeStamp   string `json:"time"`
}

func (c *Client) writeMessage() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		message, ok := <-c.Message
		if !ok {
			return
		}

		c.Conn.WriteJSON(message)
	}
}

func (c *Client) readMessage(hub *Hub) {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, m, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		// Deserialize the received message
		var receivedMessage Message
		err = json.Unmarshal(m, &receivedMessage)
		if err != nil {
			log.Printf("Error deserializing message: %v", err)
			return
		}

		msg := &Message{
			Content:     receivedMessage.Content,
			RoomID:      c.RoomID,
			Username:    c.Username,
			SenderID:    c.ID,
			RecipientID: receivedMessage.RecipientID,
			Action:      receivedMessage.Action,
			TimeStamp:   time.Now().Format("Jan 2, 2006 at 3:04pm"),
		}

		if msg.Action == "message" {
			err = msg.Store() // assuming db is accessible here
			if err != nil {
				log.Printf("Error storing message: %v", err)
				return
			}
		}

		hub.Broadcast <- msg
	}
}

func (m *Message) Store() error {
	columns := []string{"content", "room_id", "username", "sender_id", "recipient_id", "action", "timestamp"}
	values := []interface{}{m.Content, m.RoomID, m.Username, m.SenderID, m.RecipientID, m.Action, m.TimeStamp}
	err := utils.InsertData("message", columns, values...)
	if err != nil {
		return err
	}
	return nil
}
