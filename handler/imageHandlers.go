package handler

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"realTimeForum/utils"
)

func ImageHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("yo")
	if r.Method != "GET" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	var (
		imageId = r.URL.Query().Get("id")
	)
	token , _ := r.Cookie("real-time-form-token")
	if !utils.ElementAlreadyExist(token.Value, "session", "token") {
		log.Println("request with unauthenticated token from " + r.RemoteAddr)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	img, err := ioutil.ReadFile("serverFiles/postImages/" + imageId+".jpg") // Remplacez par le chemin de votre image
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "image/jpeg")
	w.Write(img)

}
