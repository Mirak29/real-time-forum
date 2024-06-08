package main

import (
	"fmt"
	"net/http"
	"realTimeForum/handler"
	"realTimeForum/utils"
	"realTimeForum/ws"

	_ "github.com/mattn/go-sqlite3"
)

func main() {

	hub := ws.NewHub()
	wsHandler := ws.NewHandler(hub)
	go hub.Run()
	hub.Rooms["1"] = &ws.Room{
		ID:      "1",
		Name:    "General",
		Clients: make(map[string]*ws.Client),
	}

	fmt.Println(utils.GetCommentsByPostID(""))
	http.HandleFunc("/", handler.OriginHandler)
	http.HandleFunc("/images", handler.ImageHandler)
	http.HandleFunc("/loginVerif", handler.LoginHandler)
	http.HandleFunc("/post", handler.PostHandler)
	http.HandleFunc("/reaction", handler.ReactionHandler)
	http.HandleFunc("/comment", handler.CommentHandler)
	http.HandleFunc("/createRoom", wsHandler.CreateRoom)
	http.HandleFunc("/joinRoom/", wsHandler.JoinRoom)
	http.HandleFunc("/getRooms", wsHandler.GetRooms)
	http.HandleFunc("/getClients/", wsHandler.GetClients)
	http.HandleFunc("/chatHistory", handler.HistoryHandler)
	http.HandleFunc("/countMessages", handler.CountMessagesHandler)
	http.HandleFunc("/firstMessage", handler.FirstMessageHandler)
	http.HandleFunc("/lastConv", handler.LastMsgConv)
	http.HandleFunc("/user", handler.UserById)
	staticFiles := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", staticFiles))
	fmt.Println("http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
