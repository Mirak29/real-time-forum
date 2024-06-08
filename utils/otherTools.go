package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"realTimeForum/models"
	"strconv"
	"strings"
	"time"

	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

var EvaluateForm = func(form map[string]string) map[string]map[string]interface{} {
	errorinventory := make(map[string]map[string]interface{})
	errorinventory["error"] = map[string]interface{}{}
	if formHaveEmptyValue(form) {
		errorinventory["error"]["empty-value"] = true
	}
	if ElementAlreadyExist(form["email"], "user", "email") {
		errorinventory["error"]["email"] = form["email"] + " already exists"
	}
	if ElementAlreadyExist(form["nickname"], "user", "username") {
		errorinventory["error"]["nickname"] = form["nickname"] + " already exists"
	}
	if form["password"] != form["confirmPassword"] {
		errorinventory["error"]["password"] = "confimation password is different from the password"
	}
	if len(errorinventory["error"]) == 0 {
		errorinventory["error"] = nil
	}
	return errorinventory
}

var formHaveEmptyValue = func(form map[string]string) bool {
	for _, v := range form {
		if v == "" {
			return true
		}
	}
	return false
}

var HandleRegisterRequest = func(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		log.Println("=> got Method Not allowed from " + r.RemoteAddr)
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	form, err := extractFormFromBody(r.Body)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	errorinventory := EvaluateForm(form)
	if errorinventory["error"] != nil {
		w.Header().Set("Content-Type", "text/json")
		respons, err := json.Marshal(errorinventory)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		log.Println("=>" + r.RemoteAddr + " send a bad form")
		w.Write(respons)
		return
	}
	passwordCrypted, err := bcrypt.GenerateFromPassword([]byte(form["password"]), bcrypt.DefaultCost)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	ageInt , err := strconv.Atoi(form["age"])
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	err = InsertData("user", []string{"username", "email", "password", "Age", "gender", "firstname", "lastname"},
		form["nickname"], form["email"], passwordCrypted,ageInt, form["gender"], form["firstName"], form["lastName"])
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
	w.Header().Set("Content-Type", "text/json")
	respons, err := json.Marshal(map[string]interface{}{"errors": nil})
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(respons)
	log.Println(form["nickname"] + " successfully registered")
}

var extractFormFromBody = func(body io.ReadCloser) (map[string]string, error) {
	value, err := io.ReadAll(body)
	if err != nil {
		return nil, err
	}
	form := map[string]string{}
	err = json.Unmarshal(value, &form)
	if err != nil {
		return nil, err
	}
	return form, nil
}

var HandleLoginRequest = func(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		log.Println("=> got Method Not allowed from " + r.RemoteAddr)
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	form, err := extractFormFromBody(r.Body)

	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	userId, err := Login(form)
	if err != nil {
		w.Header().Set("Content-Type", "text/json")
		respons, err := json.Marshal(map[string]string{"error": err.Error()})
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Write(respons)
		return
	}

	newToken, err := uuid.NewV4()
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	newCookie := &http.Cookie{
		Name:     "real-time-form-token",
		Value:    newToken.String(),
		Expires:  time.Now().Add(24 * time.Hour),
		SameSite: http.SameSiteDefaultMode,
	}
	err = InsertData("session", []string{"user_id", "token", "date_de_creation", "date_limite"},
		userId, newToken.String(), time.Now(), time.Now().Add(24*time.Hour))
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, newCookie)
}

var HandleTokenVerifiicationRequest = func(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		log.Println("=> got Method Not allowed from " + r.RemoteAddr)
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	responseValue := map[string]interface{}{"haveSession": true}

	w.Header().Set("Content-type", "application/json")
	response, err := json.Marshal(responseValue)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	err = verifySession(r)
	if err != nil {
		log.Println(err)
		responseValue["haveSession"] = false
		response, err = json.Marshal(responseValue)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Write(response)
		return
	}
	w.Write(response)

}

var Login = func(form map[string]string) (int, error) {
	db, _ := OpenDatabase()
	defer db.Close()
	var storedPassword string
	var id int
	err := db.QueryRow("SELECT id,password FROM user WHERE (email = ? OR username = ?)", form["email"], form["email"]).Scan(&id, &storedPassword)
	if err != nil {
		fmt.Println(err)
		return 0, errors.New("email or username  not found")
	}
	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(form["password"]))
	if err != nil {
		return 0, errors.New("invalid password")
	}
	return id, nil
}
var HandleInsertPostRequest = func(w http.ResponseWriter, r *http.Request) {
	haveImage := 0
	if r.Method != "POST" {
		log.Println("")
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	err := verifySession(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	err = r.ParseMultipartForm(10 << 20)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println(err)
		return
	}
	if r.FormValue("title") == "" || r.FormValue("content") == "" || len(r.Form["category_post"]) == 0 {
		JsonResponseSender(w, http.StatusBadRequest,
			map[string]interface{}{"error": "have some empty values on the form"})
		return
	}
	cateGoriesId := []int{}
	for _, v := range r.Form["category_post"] {
		cateGoriesId = append(cateGoriesId, models.CategoriesMap[v]+1)
	}
	photo, _, _ := r.FormFile("photo")
	if photo != nil {
		haveImage = 1
	}
	cookie, err := r.Cookie("real-time-form-token")
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user, err := GetUserInfoByToken(cookie.Value)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	err = InsertPost(haveImage, r.FormValue("title"), html.EscapeString(r.FormValue("content")), cateGoriesId, time.Now(), user["id"].(int), photo)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	JsonResponseSender(w, http.StatusOK, map[string]interface{}{"error": nil})
}

var JsonResponseSender = func(w http.ResponseWriter, statusCode int, content map[string]interface{}) {
	contentInByteFormat, _ := json.Marshal(content)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(contentInByteFormat)
}

var InsertPost = func(haveImage int, title, body string, categories []int, CreatedAt time.Time, userID int, photo multipart.File) error {
	db, err := OpenDatabase()
	if err != nil {
		return err
	}
	defer db.Close()

	query := `INSERT INTO post (title, body, user_id, created_at, haveImages)
	VALUES (?, ?, ?, ?, ?)`

	_, err = db.Exec(query, title, body, userID, CreatedAt, haveImage)

	if err != nil {
		return err
	}

	query = `SELECT id FROM post WHERE created_at = ?`
	rows, err := db.Query(query, CreatedAt)
	if err != nil {
		return err
	}
	defer rows.Close()

	var id int
	for rows.Next() {
		err := rows.Scan(&id)
		if err != nil {
			return err
		}
	}
	for _, v := range categories {
		InsertData("post_category", []string{"category_id", "post_id"}, v, id)
	}
	if haveImage == 0 {
		return nil
	}
	defer photo.Close()

	fichierSortie, err := os.Create(fmt.Sprintf("serverFiles/postImages/%s.jpg", strconv.Itoa(id)))
	if err != nil {
		return err
	}
	defer fichierSortie.Close()

	_, err = io.Copy(fichierSortie, photo)
	if err != nil {
		return err
	}

	return nil
}

var verifySession = func(r *http.Request) error {
	cookie, err := r.Cookie("real-time-form-token")
	if err != nil {
		return err
	}
	if !ElementAlreadyExist(cookie.Value, "session", "token") {
		return errors.New(r.RemoteAddr + " don't have session on the database")
	}
	return nil
}
var HandleGetPostListRequest = func(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	err := verifySession(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	cookie, err := r.Cookie("real-time-form-token")
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user, err := GetUserInfoByToken(cookie.Value)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	posts, err := Getlatest(page, user["id"].(int), 5)
	fmt.Println(posts)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
var GetPostReaction = func(id int) (map[string]int, error) {
	db, err := OpenDatabase()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	var like, dislike int
	err = db.QueryRow("SELECT COUNT(*) FROM reactions_post WHERE  post_id = ? AND reactions = 1 ", id).Scan(&like)
	if err != nil {
		return nil, err
	}
	err = db.QueryRow("SELECT COUNT(*) FROM reactions_post WHERE  post_id = ? AND disreactions = 1 ", id).Scan(&dislike)
	if err != nil {
		return nil, err
	}
	return map[string]int{
		"like":    like,
		"dislike": dislike,
	}, nil
}
var Getlatest = func(page, userId, limit int) ([]map[string]interface{}, error) {
	db, err := OpenDatabase()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	posts := []map[string]interface{}{}
	var (
		id, haveImage                     int
		title, body, username, created_at string
	)
	offset := page * limit
	rows, err := db.Query(fmt.Sprintf(`SELECT post.id, title, body, username, created_at,
	haveImages	FROM post
	JOIN user ON post.user_id = user.id
	ORDER BY post.id DESC
	LIMIT %d OFFSET %d`, limit, offset))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		err := rows.Scan(&id, &title, &body, &username, &created_at, &haveImage)
		if err != nil {
			return nil, err
		}
		PostReaction, err := GetPostReaction(id)
		if err != nil {
			return nil, err
		}
		PostCategoy, err := GetCategoryByPostId(id)
		if err != nil {
			return nil, err
		}
		comments, err := GetCommentsByPostID(strconv.Itoa(id))
		if err != nil {
			return nil, err
		}
		posts = append(posts, map[string]interface{}{
			"id":            id,
			"title":         title,
			"body":          body,
			"username":      username,
			"created_at":    FormatTimestamp(created_at),
			"haveImages":    haveImage,
			"reaction":      PostReaction,
			"category":      PostCategoy,
			"comments":      comments,
			"userAlrealike": IsPostLikedByUser(strconv.Itoa(userId), strconv.Itoa(id)),
			"userAlreadyDislike": !IsPostLikedByUser(strconv.Itoa(userId), strconv.Itoa(id)) &&
				UserAlreadyLikeOrDislike(strconv.Itoa(userId), "post", strconv.Itoa(id)),
		})
	}
	return posts, nil
}

// var GetPostcommentByPostId = func(id int) ([]map[string]interface{}, error) {

// 	return []map[string]interface{}{}, nil
// }

func GetCommentsByPostID(postID string) ([]map[string]interface{}, error) {
	db, err := OpenDatabase()
	if err != nil {
		return nil, err
	}
	defer db.Close()

	// Prepare a SQL query with a placeholder for the post ID
	stmt, err := db.Prepare("SELECT comment.id, body, username, created_at FROM comment,user WHERE comment.user_id=user.id and post_id = ? ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	// Execute the prepared query and scan the results into a slice of 'models.Comment'
	rows, err := stmt.Query(postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var (
		id                        int
		userName, body, createdAt string
		allComments               = []map[string]interface{}{}
	)
	for rows.Next() {
		err := rows.Scan(&id, &body, &userName, &createdAt)
		if err != nil {
			return nil, err
		}
		allComments = append(allComments, map[string]interface{}{
			"id":        id,
			"body":      body,
			"userName":  userName,
			"createdAt": FormatTimestamp(createdAt),
			"reaction":  GetReactionCommentByPostId(id),
		})
	}
	return allComments, nil
}

var GetReactionCommentByPostId = func(id int) map[string]int {
	db, _ := OpenDatabase()
	var likeAmont, disLikeAmoun int
	likeQuery := "SELECT COUNT(*) as like_count FROM reactions_comment WHERE  comment_id = ? AND reactions = 1 "
	dislikeQuery := "SELECT COUNT(*) as like_count FROM reactions_comment WHERE  comment_id = ? AND disreactions = 1 "
	db.QueryRow(likeQuery, id).Scan(&likeAmont)
	db.QueryRow(dislikeQuery, id).Scan(&disLikeAmoun)
	return map[string]int{
		"like":    likeAmont,
		"dislike": disLikeAmoun,
	}

}

func UserAlreadyLike(id string, Type string, idType string) bool {
	db, _ := OpenDatabase()
	cont := 0
	if Type == "post" {
		query := "SELECT COUNT(*) as like_count FROM reactions_post WHERE  post_id = ? AND user_id = ? AND reactions = 1 "
		db.QueryRow(query, idType, id).Scan(&cont)
		return cont != 0
	}
	query := "SELECT COUNT(*) as like_count FROM reactions_comment WHERE  comment_id = ? AND user_id = ? AND reactions = 1 "
	db.QueryRow(query, idType, id).Scan(&cont)
	return cont != 0
}
func DeleteLikeOrDislikeFromUser(UserId string, postOrComent string, commentOrpostid string) error {
	db, _ := OpenDatabase()
	if postOrComent == "post" {
		// Exécutez la requête SQL
		query := "DELETE FROM reactions_post WHERE user_id = ? AND post_id = ? "

		_, err := db.Exec(query, UserId, commentOrpostid)
		if err != nil {
			return err
		}
	}
	query := "DELETE FROM reactions_comment WHERE user_id = ? AND comment_id = ?"
	// Exécutez la requête SQL
	_, err := db.Exec(query, UserId, commentOrpostid)
	if err != nil {
		return err
	}
	return nil
}
func UserAlreadyLikeOrDislike(userId string, Type string, idType string) bool {
	db, _ := OpenDatabase()
	cont := 0
	if Type == "post" {
		query := "SELECT COUNT(*) as dislike_count FROM reactions_post WHERE post_id = ? AND user_id = ?"
		db.QueryRow(query, idType, userId).Scan(&cont)
		return cont != 0
	}
	query := "SELECT COUNT(*) as dislike_count FROM reactions_comment WHERE comment_id = ? AND user_id = ?"
	db.QueryRow(query, idType, userId).Scan(&cont)
	return cont != 0
}
func HandlePostReactionRequest(w http.ResponseWriter, r *http.Request) {
	err := verifySession(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	cookie, err := r.Cookie("real-time-form-token")
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user, err := GetUserInfoByToken(cookie.Value)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	postId := r.URL.Query().Get("postId")
	action := r.URL.Query().Get("action")
	actionType := map[string]string{
		"like":    "reactions",
		"dislike": "disreactions",
	}[action]
	HandleLikeOrDislikeAction(postId, actionType, user["id"].(int))

}

var HandleLikeOrDislikeAction = func(postId, reactionType string, user int) {
	userAlreadyNotLikeOrDislike := map[string]bool{
		"reactions":    !UserAlreadyLike(strconv.Itoa(user), "post", postId),
		"disreactions": UserAlreadyLike(strconv.Itoa(user), "post", postId),
	}
	if postId != "" && UserAlreadyLikeOrDislike(strconv.Itoa(user), "post", postId) {
		if userAlreadyNotLikeOrDislike[reactionType] {
			DeleteLikeOrDislikeFromUser(strconv.Itoa(user), "post", postId)
			InsertData("reactions_post", []string{reactionType, "user_id", "post_id"}, "1", strconv.Itoa(user), postId)
			return
		}
		return
	}
	if postId != "" {
		InsertData("reactions_post", []string{reactionType, "user_id", "post_id"}, "1", strconv.Itoa(user), postId)
		return
	}
}
var HandleDislikeAction = func(postId string, user int) {

}

func FormatTimestamp(timestamp string) string {
	createdAt, _ := time.Parse(time.RFC3339, timestamp)

	formattedTime := createdAt.Format("02 Jan 2006 15:04:05")
	return formattedTime
}

var HandleInsertCommentRequest = func(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	err := verifySession(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	err = r.ParseMultipartForm(10 >> 20)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println(err)
		return
	}
	cookie, err := r.Cookie("real-time-form-token")
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user, err := GetUserInfoByToken(cookie.Value)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	timeNow := time.Now()
	if r.FormValue("comment-content") == "" {
		fmt.Println("emty comment")
		w.WriteHeader(400)
		return
	}

	InsertData("comment", []string{"body", "user_id", "post_id", "created_at"},
		html.EscapeString(r.FormValue("comment-content")), user["id"].(int), r.FormValue("postId"), timeNow)
	db, _ := OpenDatabase()
	id := 0
	db.QueryRow(`SELECT id FROM comment WHERE created_at = ?`, timeNow).Scan(&id)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":        id,
		"userName":  user["username"],
		"body":      r.FormValue("comment-content"),
		"createdAt": timeNow.Format("02 Jan 2006 15:04:05"),
	})
}

var FilterPosts = func(categoryTypes []string, liked bool, user_id int, created bool) ([]map[string]interface{}, error) {
	db, _ := OpenDatabase()
	selector := "SELECT DISTINCT p.id, p.body, p.created_at, p.user_id,p.haveImages, p.title, u.username \nFROM post p"
	joiner := "\nJOIN post_category pc ON p.id = pc.post_id\nJOIN category c ON pc.category_id = c.id\nJOIN user u ON p.user_id = u.id\n"
	condition := "WHERE c.type LIKE '%'"

	if liked {
		joiner += "LEFT JOIN reactions_post r ON p.id = r.post_id\n"
		condition += " AND r.reactions = 1 AND r.user_id = " + strconv.Itoa(user_id)
	}
	if created {
		str_id := strconv.Itoa(user_id)
		condition += " AND p.user_id = " + str_id
	}
	if categoryTypes != nil {
		condition += ` AND c.type IN (` + generatePlaceholders(len(categoryTypes)) + `)`
	}
	query := selector + joiner + condition
	stmt, err := db.Prepare(query)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	rows, err := stmt.Query()
	if categoryTypes != nil {
		args := make([]interface{}, len(categoryTypes))
		for i, categoryType := range categoryTypes {
			args[i] = categoryType
		}
		rows, err = stmt.Query(args...)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var (
		id, userId, haveImage             int
		username, body, created_at, title string
		posts                             = []map[string]interface{}{}
	)
	for rows.Next() {
		if err := rows.Scan(&id, &body, &created_at, &userId, &haveImage, &title, &username); err != nil {
			return nil, err
		}
		PostReaction, err := GetPostReaction(id)
		if err != nil {
			return nil, err
		}
		PostCategoy, err := GetCategoryByPostId(id)
		if err != nil {
			return nil, err
		}
		comments, err := GetCommentsByPostID(strconv.Itoa(id))
		if err != nil {
			return nil, err
		}
		posts = append(posts, map[string]interface{}{
			"id":            id,
			"title":         title,
			"body":          body,
			"username":      username,
			"created_at":    FormatTimestamp(created_at),
			"haveImages":    haveImage,
			"reaction":      PostReaction,
			"category":      PostCategoy,
			"comments":      comments,
			"userAlrealike": IsPostLikedByUser(strconv.Itoa(userId), strconv.Itoa(id)),
		})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return posts, nil
}

func IsPostLikedByUser(idUser, PosId string) bool {
	db, _ := OpenDatabase()
	count := 0
	query := "SELECT COUNT(*) as like_count FROM reactions_post WHERE  post_id = ?  AND user_id=? AND reactions = 1 "
	db.QueryRow(query, PosId, idUser).Scan(&count)
	return count != 0
}

var generatePlaceholders = func(count int) string {
	placeholders := make([]string, count)
	for i := range placeholders {
		placeholders[i] = "?"
	}
	return strings.Join(placeholders, ", ")
}
var HandleFilterPostRequest = func(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	err := verifySession(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	err = r.ParseMultipartForm(10 >> 20)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println(err)
		return
	}
	if len(r.Form["category"]) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	result, err := FilterPosts(r.Form["category"], false, 0, false)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println(err)
		return
	}
	json.NewEncoder(w).Encode(result)
}
var HandleUserInfosRequest = func(w http.ResponseWriter, r *http.Request) {

	if r.Method != "GET" {
		log.Println("=> got bad request from " + r.RemoteAddr)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	cookie, _ := r.Cookie("real-time-form-token")
	userInfos, err := GetUserInfoByToken(cookie.Value)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/json")
	response, err := json.Marshal(userInfos)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(response)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	err := verifySession(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	cookie, err := r.Cookie("real-time-form-token")
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	DeleteUserSession(cookie.Value)
}
func DeleteUserSession(token string) {
	db, _ := OpenDatabase()
	defer db.Close()

	deleteStatement := "DELETE FROM session WHERE token = ?"
	_, err := db.Exec(deleteStatement, token)
	if err != nil {
		fmt.Println("Erreur lors de la suppresssion dans la table session :", err)
		return
	}
}
