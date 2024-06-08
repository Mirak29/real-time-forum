package handler

import (
	"encoding/json"
	"net/http"
	"realTimeForum/utils"
	"strconv"
)

func HistoryHandler(w http.ResponseWriter, r *http.Request) {
	senderID := r.URL.Query().Get("sender")
	recipientID := r.URL.Query().Get("recipient")
	offset := r.URL.Query().Get("offset")
	messages, err := utils.GetMessagesBySenderAndRecipient(senderID, recipientID, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func CountMessagesHandler(w http.ResponseWriter, r *http.Request) {
	db, _ := utils.OpenDatabase()
	senderID := r.URL.Query().Get("senderId")
	recipientID := r.URL.Query().Get("recipientId")

	stmt, err := db.Prepare(`SELECT COUNT(*) FROM message WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	var count int
	err = stmt.QueryRow(senderID, recipientID, recipientID, senderID).Scan(&count)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(count)
}

func FirstMessageHandler(w http.ResponseWriter, r *http.Request) {
	db, _ := utils.OpenDatabase()
	senderID := r.URL.Query().Get("senderId")
	recipientID := r.URL.Query().Get("recipientId")

	stmt, err := db.Prepare(`SELECT id FROM message WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?) ORDER BY id ASC LIMIT 1`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer stmt.Close()
	var id int
	err = stmt.QueryRow(senderID, recipientID, recipientID, senderID).Scan(&id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(id)
}

func LastMsgConv(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	if userID == "" {
		http.Error(w, "Missing userId parameter", http.StatusBadRequest)
		return
	}

	db, err := utils.OpenDatabase()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	messages, err := utils.GetLastMgConv(db, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func UserById(w http.ResponseWriter, r *http.Request) {
	param := r.URL.Query().Get("userId")
	userID, err := strconv.Atoi(param)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	db, err := utils.OpenDatabase()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	user, err := utils.GetUserByID(userID)
	if err != nil {
		http.Error(w, "Error fetching user", http.StatusInternalServerError)
		return
	}
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Encoder les informations de l'utilisateur en JSON et les écrire dans la réponse
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
