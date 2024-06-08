package handler

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"realTimeForum/utils"
)

var OriginHandler = func(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		log.Println(r.RemoteAddr + "aply a bad request")
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	tpl, err := template.ParseFiles("static/index.html")
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	err = tpl.Execute(w, nil)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	log.Println("=>" + r.RemoteAddr + " got access to the website")
}
var LoginHandler = func(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("purpose") == "signIn" {
		log.Println("=> Sign-in request from " + r.RemoteAddr)
		utils.HandleRegisterRequest(w, r)
		return
	}
	if r.Header.Get("purpose") == "login" {
		log.Println("=> Login request from " + r.RemoteAddr)
		utils.HandleLoginRequest(w, r)
		return
	}
	if r.Header.Get("purpose") == "tokenVerification" {
		log.Println("=> Token-verification  request from " + r.RemoteAddr)
		utils.HandleTokenVerifiicationRequest(w, r)
		return
	}
	if r.Header.Get("purpose") == "getUserInfos"{
		log.Println("=> user-information requests  from " + r.RemoteAddr)
		utils.HandleUserInfosRequest(w, r)
		return 
	}
	if r.Header.Get("purpose") == "logout" {
		log.Println("=> Logout request from " + r.RemoteAddr)
		utils.LogoutHandler(w, r)
		return
	}

}

var PostHandler = func(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("purpose") == "insert-post" {
		log.Println("=> Insert post request from " + r.RemoteAddr)
		utils.HandleInsertPostRequest(w, r)
		return
	}
	if r.Header.Get("purpose") == "get-post-list" {
		log.Println("=> get-post-list request from " + r.RemoteAddr)
		utils.HandleGetPostListRequest(w, r)
		return
	}
	if r.Header.Get("purpose") == "filter-post"{
		log.Println("=> filter-post request from " + r.RemoteAddr)
		utils.HandleFilterPostRequest(w, r)
		// TODO: make filter-post request handler 
		return 
	}
}

var ReactionHandler = func(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("reaction-type") == "post" {
		utils.HandlePostReactionRequest(w, r)
		return
	}
	if r.Header.Get("reaction-type") == "comment" {
		//TODO: make the reaction  comment request handler
		return
	}
}

var CommentHandler = func(w http.ResponseWriter, r *http.Request) {

	fmt.Println(r.Header.Get("purpose"))
	if r.Header.Get("purpose") == "insert-comment"{
		utils.HandleInsertCommentRequest(w, r)
		return 
	}
}
