package utils
import (
	"database/sql"
	"fmt"
)
type Message struct {
	Id          int    `json:"id"`
	Content     string `json:"content"`
	RoomID      string `json:"roomId"`
	Username    string `json:"username"`
	SenderID    string `json:"senderId"`
	RecipientID string `json:"recipientId"`
	Action      string `json:"action"`
	TimeStamp   string `json:"time"`
}
var OpenDatabase = func() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "dataBase/Db.sqlite")
	if err != nil {
		return nil, err
	}
	return db, nil
}
func ElementAlreadyExist(value, tableName, row string) bool {
	db, _ := sql.Open("sqlite3", "dataBase/Db.sqlite")
	defer db.Close()
	count := 0
	db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM %s WHERE %s = ?", tableName, row), value).Scan(&count)
	return count > 0
}
var InsertData = func(tableName string, columns []string, values ...interface{}) error {
	db, err := OpenDatabase()
	if err != nil {
		return err
	}
	if len(columns) != len(values) {
		return fmt.Errorf("le nombre de colonnes ne correspond pas au nombre de valeurs")
	}
	query := fmt.Sprintf("INSERT INTO %s (%s", tableName, columns[0])
	for i := 1; i < len(columns); i++ {
		query += ", " + columns[i]
	}
	query += ")"
	placeholders := make([]string, len(columns))
	for i := range placeholders {
		placeholders[i] = "?"
	}
	query += " VALUES (" + placeholders[0]
	for i := 1; i < len(placeholders); i++ {
		query += ", " + placeholders[i]
	}
	query += ")"
	stmt, err := db.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()
	defer db.Close()
	_, err = stmt.Exec(values...)
	if err != nil {
		return err
	}
	return nil
}
func GetUserInfoByToken(token string) (map[string]interface{}, error) {
	id := 0
	var email, username, age, gender, firstName, lastName string
	db, _ := OpenDatabase()
	rows, err := db.Query(`
        SELECT u.id, u.username, u.email, u.Age, u.gender , u.firstname, u.lastname
        FROM user AS u
        INNER JOIN session AS s ON u.id = s.user_id
        WHERE s.token = ?`, token)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		err = rows.Scan(&id, &username, &email, &age, &gender, &firstName, &lastName)
		if err != nil {
			return nil, err
		}
	}
	return map[string]interface{}{
		"id":        id,
		"username":  username,
		"email":     email,
		"gender":    gender,
		"firstName": firstName,
		"lastName":  lastName,
	}, nil
}
var GetCategoryByPostId = func(postId int) ([]string, error) {
	db, err := OpenDatabase()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	rows, err := db.Query("SELECT c.type FROM post p JOIN post_category pc ON p.id = pc.post_id JOIN category c ON pc.category_id = c.id WHERE p.id = ?", postId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var categories []string
	for rows.Next() {
		var categorie string
		rows.Scan(&categorie)
		categories = append(categories, categorie)
	}
	return categories, nil
}
func GetMessagesBySenderAndRecipient(senderID string, recipientID string, offset string) ([]*Message, error) {
	db, _ := OpenDatabase()
	stmt, err := db.Prepare(`SELECT * FROM message WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?) ORDER BY id DESC LIMIT 10 OFFSET ?`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	rows, err := stmt.Query(senderID, recipientID, recipientID, senderID, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var messages []*Message
	for rows.Next() {
		var msg Message
		err := rows.Scan(&msg.Id, &msg.Content, &msg.RoomID, &msg.Username, &msg.SenderID, &msg.RecipientID, &msg.Action, &msg.TimeStamp)
		if err != nil {
			return nil, err
		}
		messages = append(messages, &msg)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return messages, nil
}
func GetLastMgConv(db *sql.DB, userID string) ([]*Message, error) {
	rows, err := db.Query(`
	SELECT * FROM message 
	WHERE sender_id = ? OR recipient_id = ?
	GROUP BY CASE WHEN sender_id < recipient_id THEN sender_id ELSE recipient_id END, 
	CASE WHEN sender_id > recipient_id THEN sender_id ELSE recipient_id END
	ORDER BY MAX(id) DESC
	`, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var messages []*Message
	for rows.Next() {
		var msg Message
		if err := rows.Scan(&msg.Id, &msg.Content, &msg.RoomID, &msg.Username, &msg.SenderID, &msg.RecipientID, &msg.Action, &msg.TimeStamp); err != nil {
			return nil, err
		}
		messages = append(messages, &msg)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return messages, nil
}
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	// Ajoutez d'autres champs selon la structure de votre table utilisateur.
}
func GetUserByID(userID int) (*User, error) {
	db, _ := OpenDatabase()
	var user User
	stmt, err := db.Prepare("SELECT id, username FROM user WHERE id = ?")
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	err = stmt.QueryRow(userID).Scan(&user.ID, &user.Username)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Aucun utilisateur trouvé avec cet ID.
		}
		return nil, err
	}
	fmt.Println(user)
	return &user, nil
}
