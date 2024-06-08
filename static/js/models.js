import { OriginHandler, HomeHandler, LoginHandler } from "./handlers.js";
import { navigateTo, sendFormData } from "./utils.js";
const routes = {
  "/home": HomeHandler,
  "/login": LoginHandler,

}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const categories = ["Technology", "Science", "Sports",
  "Music", "Art", "Fashion", "Food",
  "Travel", "Health", "Business",
  "Education", "Nature", "Entertainment",
  "History", "Literature", "Politics",
  "Religion", "Philosophy", "Gaming",
  "Cookies", "Programming", "Golang"
]
class Home {
  constructor() {
    this.token = document.cookie.split(';')[0].split("=")[1];
    this.onPhonMode = false
    this.html = `<div id="add-post-button">
    <i class="fa-solid fa-plus"></i>
    </div>
    <div id="nav">
    <div class="logo" >
            <h1 class="h1-home"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                    <path
                        d="M280-240q-17 0-28.5-11.5T240-280v-80h520v-360h80q17 0 28.5 11.5T880-680v600L720-240H280ZM80-280v-560q0-17 11.5-28.5T120-880h520q17 0 28.5 11.5T680-840v360q0 17-11.5 28.5T640-440H240L80-280Zm520-240v-280H160v280h440Zm-440 0v-280 280Z" />
                </svg>forum<span>01</span></h1>
    </div>
    <div>
    <div class="menu hidden"  id ="filter-menu" height= "24"  width="24" >
    <i class="fa-solid fa-filter"></i>
</div>
        <div class="menu hidden " id="message-menu"><svg xmlns="http://www.w3.org/2000/svg" height="24"
                viewBox="0 -960 960 960" width="24">
                <path
                    d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h404q-4 20-4 40t4 40H160l320 200 146-91q14 13 30.5 22.5T691-572L480-440 160-640v400h640v-324q23-5 43-14t37-22v360q0 33-23.5 56.5T800-160H160Zm0-560v480-480Zm600 80q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Z" />
            </svg>
        </div>
        <div class="menu" id="notif"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960"
                width="24" class="on">
                <path
                    d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z">
                </path>
            </svg></div>
        <div id="profil" class="menu"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960"
                width="24">
                <path
                    d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
            </svg>
            <pre id="profileInfos"></pre>
        </div>

    </div>
</div>
<div id="side-bar-left">
    <div>
        <form action="/filter" method="post" id="filter-form">
            <div class="category-container">
            </div>
            <button type="submit" id="cat_filter">Filter</button>
        </form>
    </div>
</div>
<div id="side-bar-right">
    <div>
        <h1 class="h1-home">Online User</h1>
    </div>
    <div id="current-conv"></div>
    <div id="onlineUser-container">
    </div>
</div>
<div id=midle class="">
    <!-- <div class="post-card">
      <div class="post-header">
        <div class="post-owner">
          <div class="post-owner-img">
            <img src="/static/images/prifimg.png" alt="">
          </div>
          <div class="post-details">
            <span>USER NAME</span>
            <span><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                <path
                  d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" />
              </svg>date of post</span>
          </div>
        </div>
        <div class="category">CR7 the GOAT</div>
      </div>
      <div class="post-content">
        <div class="title-area">
          <h3>lolololololo</h3>
        </div>
        <div class="text-area">
        </div>
        <div class="images-area">
          <img src="http://localhost:8080/images?token=333333333333333&postId=111111" alt="">
        </div>
      </div>
      <div class="post-footer">
        <div class="react">
          <span><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
              <path
                d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
            </svg><span>10</span></span>
          <span><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
              <path
                d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z" />
            </svg><span>10</span></span>
        </div>
        <div class="comment"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path
              d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z" />
          </svg>10</div>
      </div>
    </div> -->


</div>
<div id="profile-card"> </div>
<div id="profile-options" class="hide-profile">

<div class="profile-option" id = "logOUT"> Disconect </div>
</div>
<div id="popPupArea">
</div>
`

    this.listenersFuncs = {
      placePoPups: () => {
        let NavBarHeight = this.elements.navElement.offsetHeight
        let ProofileX = this.elements.profileElement.getBoundingClientRect().x
        this.elements.profileOptions.style.top = NavBarHeight + "px"
        this.elements.profileOptions.style.left = ProofileX + "px"
      },
      togleProfilePopup: () => {
        this.elements.profileOptions.classList.toggle("hide-profile")
        this.elements.profileOptions.classList.toggle("show-profile")
      },
      createPostFormHandler: async (e) => {
        e.preventDefault()
        let formdata = new FormData(this.elements.createPostFormElement)
        let responseObjet
        await fetch('/post', {
          method: 'POST',
          headers: {
            'purpose': 'insert-post'
          },
          body: formdata
        }).then(response => {

          return response.json()
        }).then(response => responseObjet = response)
        if (responseObjet.error == null) {
          await fetch(`/post?page=0`, {
            method: 'GET',
            headers: {
              'purpose': "get-post-list"
            }
          }).then(response => response.json())
            .then(response => { this.GeneratePostCard(response[0], true); this.listenersFuncs.quitCreatePostePopup() })
        }
      },
      showImagePreview: () => {
        let formData = new FormData(this.elements.createPostFormElement);
        let fichier = formData.get('photo');
        let reader = new FileReader();
        let imagePrevieweElement = this.elements.imagePrevieweElement
        reader.onload = function (event) {
          imagePrevieweElement.src = event.target.result
          imagePrevieweElement.style.opacity = 1

        };
        reader.readAsDataURL(fichier);
      },
      quitCreatePostePopup: () => {
        this.elements.popPupArea.innerHTML = ''
        this.elements.popPupArea.style.display = 'none'
        this.elements.midle.classList.remove('blur')
        this.elements.sideBarLeft.classList.remove('blur')
        this.elements.sideBarRight.classList.remove('blur')
        this.elements.addPostButton.style.opacity = 1
        this.elements.createPostFormElement.removeEventListener("submit", this.listenersFuncs.createPostFormHandler)
        this.elements.inputPhoto.removeEventListener('change', this.listenersFuncs.showImagePreview)
      },
      showCreatePostPopup: () => {
        this.elements.midle.classList.add('blur')
        this.elements.sideBarLeft.classList.add('blur')
        this.elements.sideBarRight.classList.add('blur')
        this.elements.addPostButton.style.opacity = 0
        this.elements.popPupArea.style.display = 'flex'
        this.elements.popPupArea.innerHTML =
          `<div class="create-post">
                <div class="quit-CreatePost-Area">
                  <div id="exit-createPost">
                    <div>X</div>
                  </div>
                </div>
                <h2>Create a Post</h2>
                <form id="create-post-form" method="post" enctype="multipart/form-data">
                  <div class="form-group">
                    <label for="title">Title:</label>
                    <input type="text" id="title" name="title" required="">
                  </div>
                  <div class="form-group">
                    <div class="category-container margin-0" id="category-container-createPost">
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="content">Content:</label>
                    <textarea id="content" name="content" rows="4" required=""></textarea>
                  </div>
                  <div class="form-group" id="image-preview-div">
                    <img id="image-preview">
                  </div>
                  <div id="image-upload" class="form-group">
                    <label for="input-photo" class="custom-file-upload">
                      <i class="fa fa-cloud-upload"></i>
                      Upload your image
                    </label>
                    <input type="file" id="input-photo" name="photo" accept="image/*" style="display: none;">
                  </div>
                  <button id="create-post-submitButon" type="submit">Submit</button>
              
                </form>
              </div>`
        const categoryContainer = document.getElementById("category-container-createPost");
        let html = '';
        categories.forEach(category => {
          html += `<input type="checkbox" name="category_post" value="${category}" id="${category}1">
                 <label for="${category}1">${category}</label> `;
        });
        categoryContainer.innerHTML = html;
        this.elements.createPostFormElement = document.getElementById("create-post-form")
        this.elements.imagePrevieweElement = document.getElementById("image-preview")
        this.elements.createPostSubmitElemen = document.getElementById("create-post-submitButon")
        this.elements.inputPhoto = document.getElementById("input-photo")
        this.elements.createPostFormElement.addEventListener("submit", this.listenersFuncs.createPostFormHandler)
        this.elements.inputPhoto.addEventListener('change', this.listenersFuncs.showImagePreview)
        this.elements.exitCreatepost = document.getElementById("exit-createPost")
        this.elements.exitCreatepost.addEventListener("click", this.listenersFuncs.quitCreatePostePopup)
      },
      scrollHandler: debounce(() => {
        let kiki = (this.elements.midle.scrollTop / (this.elements.midle.scrollHeight - window.innerHeight))
        if (kiki > 0.8) {
          // Load more posts when close to the bottom
          this.GetPost();
        }

      }, 200),
      toggleLike: async (id, action) => {
        let actionIslike = action === "like"
        //get like and un like element for the post
        let element = actionIslike ? this.elements.postElments[id].likeButonElement :
          this.elements.postElments[id].dislikeButonElement
        let amountElements = actionIslike ? this.elements.postElments[id].likePostAmont :
          this.elements.postElments[id].dislikePostAmount
        let oppositeAmountElement = !actionIslike ? this.elements.postElments[id].likePostAmont :
          this.elements.postElments[id].dislikePostAmount
        let opositeElment = !actionIslike ? this.elements.postElments[id].likeButonElement :
          this.elements.postElments[id].dislikeButonElement
        if (opositeElment.classList.contains("fa-solid")) {
          oppositeAmountElement.textContent = parseInt(oppositeAmountElement.textContent) - 1
        }
        opositeElment.classList.remove("fa-solid")
        opositeElment.classList.toggle("fa-regular", true)
        await fetch(`/reaction?postId=${id}&action=${action}`, {
          method: 'GET',
          headers: {
            "reaction-type": "post"
          }
        })
        //when the user try to remove the like 
        if (element.classList.contains("fa-solid")) {
          console.log("fkfkfk");
          element.classList.remove("fa-solid")
          element.classList.add("fa-regular")
          amountElements.textContent = parseInt(amountElements.textContent) - 1
          return
        }
        amountElements.textContent = parseInt(amountElements.textContent) + 1
        //when the user try to like 
        element.classList.remove("fa-regular")
        element.classList.add("fa-solid")

      },
      insertComment: async (e, PostInfos) => {
        e.preventDefault()
        let formData = new FormData(this.elements.postElments[PostInfos.id].commentFormElement);
        formData.append("postId", PostInfos.id + "")
        fetch(`/comment`, {
          method: 'POST',
          body: formData,
          headers: {
            "purpose": "insert-comment",
          }
        })
          .then(reponse => reponse.json())
          .then(comment => {
            let commentContainer = this.elements.postElments[PostInfos.id].commentContainerElement
            if (!PostInfos["havecomment"]) {
              commentContainer.classList.remove("center")
              commentContainer.innerHTML = this.createComments([comment]);
              PostInfos["havecomment"] = true
              this.elements.postElments[PostInfos.id].commentAmount.textContent = parseInt(this.elements.postElments[PostInfos.id].commentAmount.textContent.trim()) + 1
              return
            }
            let newCommentContainer = document.createElement("div")
            newCommentContainer.classList.add("comment-unit")
            newCommentContainer.innerHTML = `<img src="/static/images/prifimg.png" alt="">
                        <div class="comment-card">
                          <div class="comment-header">
                            <span>${comment.userName}</span>
                            <span><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14">
                                <path
                                  d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z">
                                </path>
                              </svg>
                              ${comment.createdAt}
                            </span>
                          </div>
                          <div class="coment-content">
                          <pre>${comment.body}</pre>
                        </div>
                          <div class="comment-reaction hidden">
                            <div>
                              <i height="24" width="24" class="fa-regular fa-thumbs-up"></i>
                              <span>${0}</span>
                            </div>
                            <div>            
                              <i height="24" width="24" class="fa-regular fa-thumbs-up rotate"></i>
                              <span>${0}</span>
                            </div>
                          </div>
                        </div>`
            commentContainer.prepend(newCommentContainer)
            this.elements.postElments[PostInfos.id].commentAmount.textContent = parseInt(this.elements.postElments[PostInfos.id].commentAmount.textContent.trim()) + 1
          }
          )

      },
      handleSubmitFiltre: async (e) => {
        e.preventDefault()
        let filterFormElemnt = new FormData(this.elements.filterPostFormElement)
        await fetch("/post", {
          method: "POST",
          headers: {
            purpose: "filter-post"
          },  
          body: filterFormElemnt
        }).then(respone => respone.json())
          .then(posts => {
            this.elements.midle.innerHTML = ""
            this.elements.postElments = {}
            this.elements.midle.removeEventListener('scroll', this.listenersFuncs.scrollHandler);
            if (posts.length== 0) {
              this.elements.midle.innerHTML = "<h1> No result for your filter </h1>"
              this.elements.midle.classList.add("center")
              if (this.onPhonMode) this.listenersFuncs.toglefilterPopup()
              return 
            }
            posts.forEach(post => this.GeneratePostCard(post))
            if (this.onPhonMode) this.listenersFuncs.toglefilterPopup()
            this.elements.midle.classList.remove("center")


          })
      },
      handleResizing: () => {
        if (window.innerWidth < 767) {
          this.elements.sideBarRight.classList.add("hidemessage")
          this.elements.sideBarLeft.classList.add("hidden")
          this.elements.filterButon.classList.remove("hidden")
          this.elements.messageIcon.classList.remove("hidden")
          this.onPhonMode= true
          return
        }
        this.elements.sideBarRight.classList.remove("hidemessage")
        this.elements.sideBarLeft.classList.remove("hidden")
        this.elements.filterButon.classList.add("hidden")
        this.elements.messageIcon.classList.add("hidden")
        this.onPhonMode = false
        // allElements.forEach(Element => {
        //     // if (Element.classList.contains('hidden')) Element.classList.remove('hidden')
        // })
      },
      toglefilterPopup: ()=> {
        this.elements.midle.classList.toggle('blur')
        this.elements.sideBarLeft.classList.toggle('hidden')
      },
      togleMessagePopup : () => {
        this.elements.sideBarRight.classList.toggle("hidemessage")
      },
      logOut : async () => {
        await fetch ("/loginVerif", {
          headers : {
            "purpose" : "logout", 
          }
        })
        navigateTo("/login")
      }
    }
  }
  async aplyHtml() {
    document.body.innerHTML = this.html
    this.page = 0
    this.elements = {
      navElement: document.getElementById("nav"),
      midle: document.getElementById("midle"),
      profileElement: document.getElementById("profil"),
      profileOptions: document.getElementById('profile-options'),
      addPostButton: document.getElementById("add-post-button"),
      popPupArea: document.getElementById("popPupArea"),
      sideBarLeft: document.getElementById("side-bar-left"),
      sideBarRight: document.getElementById("side-bar-right"),
      postElments: {},
      filterPostFormElement: document.getElementById("filter-form"),
      profileInfos: document.getElementById("profileInfos"),
      filterButon: document.getElementById("filter-menu"),
      messageIcon: document.getElementById("message-menu"), 
      logout: document.getElementById("logOUT"),
      logo : document.querySelector(".logo")
    }
    this.elements.logo.addEventListener("click", ()=> HomeHandler(false))
    this.listenersFuncs.placePoPups()
    this.listenersFuncs.handleResizing()
    let userInfos = await this.GetUserInfos()
    this.elements.profileInfos.textContent = userInfos["firstName"] + " " + userInfos["lastName"]
    window.addEventListener("resize", this.listenersFuncs.handleResizing)
    // console.log();
  }
  async GetUserInfos() {
    let responseData
    await fetch("/loginVerif", {
      method: "GET",
      headers: {
        "purpose": "getUserInfos",
      },
    })
      .then((response) => {
        if (!response.ok) {
          handleEror(response.status);
          return;
        }
        return response.json()
      })
      .then((data) => (responseData = data));
    return responseData
  }
  togleBody(toggleBody =true ) {
    if(toggleBody) {
      document.body.classList.toggle("body-home")
      document.body.classList.toggle("body-log")
    }
  }
  createCategories() {
    const categoryContainer = document.querySelector(".category-container");
    let html = '';
    categories.forEach(category => {
      html += `<input type="checkbox" name="category" value="${category}" id="${category}">
                 <label for="${category}">${category}</label> `;
    });
    categoryContainer.innerHTML = html;
  }
  disPlayOnlineUser() {
  }

  openMessageRoomForUser(user) { }
  closeMessageRoom() { }
  lunchListeners() {
    window.addEventListener('resize', this.listenersFuncs.placePoPups)
    this.elements.profileElement.addEventListener("click", this.listenersFuncs.togleProfilePopup)
    this.elements.addPostButton.addEventListener("click", this.listenersFuncs.showCreatePostPopup)
    this.elements.midle.addEventListener('scroll', this.listenersFuncs.scrollHandler)
    this.elements.filterPostFormElement.addEventListener("submit", this.listenersFuncs.handleSubmitFiltre)
    this.elements.filterButon.addEventListener("click", this.listenersFuncs.toglefilterPopup)
    this.elements.messageIcon.addEventListener("click", this.listenersFuncs.togleMessagePopup)
    this.elements.logout.addEventListener("click",this.listenersFuncs.logOut)
  }
  removeListeners() {
    window.removeEventListener('resize', this.listenersFuncs.placePoPups)
    this.elements.profileElement.removeEventListener("click", this.listenersFuncs.togleProfilePopup)
    this.elements.createPostFormElement.removeEventListener("click", this.listenersFuncs.createPostFormHandler)
  
  }
  GeneratePostCard(PostsInfos, unshiftMode = false) {

    console.log(PostsInfos, "kiki");
    let newPostCard = document.createElement('div')
    newPostCard.className = "post-card"
    newPostCard.innerHTML =
      `<div class="post-header" id=${"post" + PostsInfos.id}>
            <div class="post-owner">
              <div class="post-owner-img">
                <img src="/static/images/prifimg.png" alt="">
              </div>
              <div class="post-details">
                <span>${PostsInfos.username}</span>
                <span><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                    <path
                      d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z">
                    </path>
                  </svg>${PostsInfos.created_at}</span>
              </div>
            </div>
            <div class="category">${PostsInfos.category ? PostsInfos.category.join(" ") : ""}</div>
          </div>
          <div class="post-content">
            <div class="title-area">
              <h3>${PostsInfos.title}</h3>
            </div>
            <div class="text-area">${PostsInfos.body}</div>
            ${PostsInfos.haveImages == 1 ? `<div class="images-area">
              <img src="/images?id=${PostsInfos.id}" alt="">
            </div>`: ""}
          </div>
          <div class="post-footer">
            <div class="react">
              <span>
                <i id="${"post-" + PostsInfos.id + "-like"}" height="24" width="24" class="${PostsInfos.userAlrealike ? "fa-solid" : "fa-regular"}  fa-regular fa-thumbs-up "></i>
                <span id = "post-${PostsInfos.id}-like-amount">${PostsInfos.reaction.like}</span>
              </span>
              <span>
                <i id="${"post-" + PostsInfos.id + "-dislike"}" height="24" width="24"
                  class="${PostsInfos.userAlreadyDislike ? "fa-solid" : "fa-regular"} fa-thumbs-up rotate"></i>
                <span id = "post-${PostsInfos.id}-dislike-amount">${PostsInfos.reaction.dislike}</span>
              </span>
            </div>
            <div class="comment"  ><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"
                id="comment-icon-${PostsInfos.id}">
                <path
                  d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z">
                </path>
              </svg>
              <div id = "comment-${PostsInfos.id}">${PostsInfos.comments.length} </div>
              
            </div>
          </div>
        <div id= "comment-div-${PostsInfos.id}" class ="hidden">
          <div class="comment-container">
            <div class="comment-area" id="comment-container-${PostsInfos.id}">
              ${this.createComments(PostsInfos.comments)}
            </div>          
          </div>
          <div class="comment-feild">
            <form class="comment-field-form" id="comment-form${PostsInfos.id}">
              <textarea name="comment-content" id="putComment" placeholder="Put your comment here..."></textarea>
              <label for="input-comment-${PostsInfos.id}">
                <div class="submit-comment">
                  <i class="fa-regular fa-paper-plane"></i>
                </div>
              </label>
              <input type="submit" style="display: none;" id="input-comment-${PostsInfos.id}">
            </form>
          </div>
        </div>
        `
    if (unshiftMode) {
      this.elements.midle.insertBefore(newPostCard,
        this.elements.midle.firstChild)
    } else {
      this.elements.midle.appendChild(newPostCard)
    }


    let postElment = {
      likeButonElement: document.getElementById("post-" + PostsInfos.id + "-like"),
      dislikeButonElement: document.getElementById("post-" + PostsInfos.id + "-dislike"),
      commentButtonElement: document.getElementById("comment-icon-" + PostsInfos.id),
      commentContainerElement: document.getElementById("comment-container-" + PostsInfos.id),
      commentFormElement: document.getElementById("comment-form" + PostsInfos.id),
      commentDiv: document.getElementById("comment-div-" + PostsInfos.id),
      commentAmount: document.getElementById("comment-" + PostsInfos.id),
      likePostAmont: document.getElementById("post-" + PostsInfos.id + "-like-amount"),
      dislikePostAmount: document.getElementById("post-" + PostsInfos.id + "-dislike-amount"),
    }
    postElment.commentButtonElement.addEventListener("click", () => {
      this.elements.postElments[PostsInfos.id].commentDiv.classList.toggle("hidden")
    })
    postElment.likeButonElement.addEventListener("click", () => this.listenersFuncs.toggleLike(PostsInfos.id, "like"))
    postElment.dislikeButonElement.addEventListener("click", () => this.listenersFuncs.toggleLike(PostsInfos.id, "dislike"))
    PostsInfos["havecomment"] = true
    if (PostsInfos.comments.length === 0) {
      postElment.commentContainerElement.classList.add("center")
      PostsInfos["havecomment"] = false
    }
    postElment.commentFormElement.addEventListener('submit', (e) => this.listenersFuncs.insertComment(e, PostsInfos))
    this.elements.postElments[PostsInfos.id] = postElment
    postElment = null
    this.kiki++




  }
  createComments(comments) {
    console.log(comments.length)
    if (comments.length == 0) {
      return `<span> 
                there is no comment for this post
            </span>`
    }
    let Comments = ""
    comments.forEach(comment => {
      Comments += `<div class="comment-unit ">
            <img src="/static/images/prifimg.png" alt="">
            <div class="comment-card">
              <div class="comment-header">
                <span>${comment.userName}</span>
                <span><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14">
                    <path
                      d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z">
                    </path>
                  </svg>
                  ${comment.createdAt}
                </span>
              </div>
              <div class="coment-content">
                <pre>${comment.body}</pre>
              </div>
              <div class="comment-reaction hidden ">
                <div>
                  <i height="24" width="24" class="fa-regular fa-thumbs-up"></i>
                  <span>${0}</span>
                </div>
                <div>            
                  <i height="24" width="24" class="fa-regular fa-thumbs-up rotate"></i>
                  <span>${0}</span>
                </div>
              </div>
            </div>
          </div>`
    }
    )
    return Comments
  }
  async GetPost() {
    let postss = []
    await fetch(`/post?page=${this.page}`, {
      method: 'GET',
      headers: {
        'purpose': "get-post-list"
      }
    })
      .then(response => {
        if (!response.ok) {
          return
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        postss = data
        if (data.length > 0) {
          data.forEach(post => {
            this.GeneratePostCard(post);

          });
          this.page++;
          return
        }
        this.elements.midle.removeEventListener('scroll', this.listenersFuncs.scrollHandler);
      })
  }
  handleImage(PostInfos) {
    if (PostInfos.haveImages) {
      return
    }

  }

  NotifListener() {
    const notifElement = document.getElementById('notif');
    const svgValue1 = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" class="on"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"></path></svg>';
    const svgValue2 = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" class="off"><path d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"></path></svg>';
    notifElement.addEventListener('click', () => {
      const svgElement = notifElement.querySelector('svg');
      if (svgElement.outerHTML === svgValue1) {
        svgElement.outerHTML = svgValue2;
      } else {
        svgElement.outerHTML = svgValue1;
      }
    });
  }

}
class Login {
  constructor() {
    this.html =
      `<h1 class="h1-log"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-240q-17 0-28.5-11.5T240-280v-80h520v-360h80q17 0 28.5 11.5T880-680v600L720-240H280ZM80-280v-560q0-17 11.5-28.5T120-880h520q17 0 28.5 11.5T680-840v360q0 17-11.5 28.5T640-440H240L80-280Zm520-240v-280H160v280h440Zm-440 0v-280 280Z"/></svg>Forum01</h1>
        <div class="container right-panel-active" id = "authContainer" >
            <!-- Sign Up -->
            <div class="container__form container--signup">
            <form action="#" class="form" id="form1">
            <h2 class="form__title">Sign Up</h2>
            <input type="text" placeholder="Nickname" class="input" required name="nickname">
            <div class="hidden warning" id="NicknameWarning"> </div>
            <input type="number" placeholder="Age" class="input" required name="age">
            <div class="hidden warning" id="AgeWarnig"> </div>
            <div class="identity">
                <input type="text" placeholder="First Name" class="input" required name="firstName">
                <input type="text" placeholder="Last Name" class="input" required name="lastName">
            </div>
            <input type="email" placeholder="Email" class="input" required name="email">
            <div class="hidden warning" id="emailWarning"></div>
            <input type="password" placeholder="Password" class="input" required name="password">
            <input type="password" placeholder="Password" class="input" required name="confirmPassword">
            <div class="gender">
                <input type="radio" value="Male" id="male" name="gender" checked>
                <label for="male" class="radio">Male</label>
                <input type="radio" value="Female" id="female" name="gender">
                <label for="female" class="radio">Female</label>
            </div>
            <div class="hidden warning" id="passwordWarning"></div>
            <button type="submit" class="btn">Sign Up</button>
            <div class="hidden warning" id="emptyvalue"></div>

        </form>
        
            </div>
        
            <!-- Sign In -->
            <div class="container__form container--signin">
                <form action="" class="form" id="form2">
                    <h2 class="form__title">Sign In</h2>
                    <input  placeholder="Email or Username" class="input" name="email" required/>
                    <input type="password" placeholder="Password" class="input" name="password" required/>
                    <div class="hidden warning" id="loginErrors">lolo</div>
                    <a href="#" class="link">Forgot your password?</a>
                    <button class="btn">Sign In</button>
                </form>
            </div>
        
            <!-- Overlay -->
            <div class="container__overlay">
                <div class="overlay">
                    <div class="overlay__panel overlay--left">
                        <button class="btn" id="signIn">Sign In</button>
                    </div>
                    <div class="overlay__panel overlay--right">
                        <button class="btn" id="signUp">Sign Up</button>
                    </div>
                </div>
            </div>
        </div>`
    this.SingInSubimitefunc = async event => {
      event.preventDefault();
      let response = await sendFormData(event, "signIn");
      if (response.error == null) {
        var inputs = document.getElementsByTagName('input');

        for (var i = 0; i < inputs.length; i++) {
          inputs[i].value = '';
        }
        this.elements.authContainer.classList.toggle("right-panel-active")
        return
      }
      Object.keys(response.error).forEach(key => {
        this.elements.SignInErrorElement[key].textContent = response.error[key]
        this.elements.SignInErrorElement[key].classList.remove("hidden");
        setTimeout(() => this.elements.SignInErrorElement[key].classList.add("hidden"), 5000)
      })
    }
    this.LoginSubimitefunc = async event => {
      let response = await sendFormData(event, "login");
      console.log(response);
      if (response.error == null) {
        navigateTo("/home");
        return
      }
      this.elements.loginErrors.textContent = response.error 
      this.elements.loginErrors.classList.remove("hidden");
      setTimeout(() => this.elements.loginErrors.classList.add("hidden"), 5000)


    }
  }
  aplyHtml() {
    document.body.innerHTML = this.html
    this.elements = {
      loginForm: document.getElementById('form2'),
      singInform: document.getElementById('form1'),
      authContainer: document.getElementById('authContainer'),
      SignInErrorElement: {
        "nickname": document.getElementById('NicknameWarning'),
        "email": document.getElementById('emailWarning'),
        "age": document.getElementById('AgeWarnig'),
        "password": document.getElementById("passwordWarning"),
        "empty-value": document.getElementById("emptyvalue"),
        
      },
      loginErrors: document.getElementById("loginErrors")
    }
  }
  togleBody() {
    if (document.body.classList.contains('body-home')) {
      document.body.classList.remove('body-home')
      document.body.classList.add('body-log')
      return
    }
  }
  lunchListeners() {
    this.elements.singInform.addEventListener("submit", this.SingInSubimitefunc)
    this.elements.loginForm.addEventListener("submit", this.LoginSubimitefunc)
  }
  removeListeners() {
    this.elements.singInform.removeEventListener("submit", this.SingInSubimitefunc)
    this.elements.loginForm.removeEventListener("submit", this.LoginSubimitefunc)
  }
  GenerateCommentCard(comment) {
  }
}


class Chat {
  constructor(ChatInfos) {
    this.chatInfos = ChatInfos;
    this.isEventHandlerAdded = false;
    this.isTyping = false;
    this.html = `<div class="chat-title">
                <div>
                    <h1>${this.chatInfos.username}</h1>
                    <div class="typing-indicator"></div>
                    <figure class="avatar"><img src="../static/images/prifimg.png" /></figure>
                </div>
                <button class="close">X</button>
            </div>
            <div class="messages">
                <div class="messages-content"></div>
            </div>
            <div class="message-box">
                <textarea type="text" class="message-input" placeholder="Type message..."></textarea>
                <button type="submit" class="message-submit">Send</button>
            </div>`;
    this.chatElement = null;
  }

  display(socket, sender, receiver) {
    this.chatElement = document.createElement("div");
    this.chatElement.className = "chat";
    this.chatElement.classList.add("chat" + this.chatInfos.id);
    this.chatElement.innerHTML = this.html;
    document.body.appendChild(this.chatElement);
    if (!this.isEventHandlerAdded) {
      const messageInput = document.querySelector('.message-input');
      const sendButton = document.querySelector('.message-submit');

      function sendMessage() {        
        const messageContent = messageInput.value.trim();
        if (messageContent === "") {
          return;
        }
        const message = {
          content: messageContent,
          recipientId: receiver.id,
          action: "message"
        };
        socket.send(JSON.stringify(message));
        messageInput.value = '';
      }

      sendButton.addEventListener('click', sendMessage);

      messageInput.addEventListener('keydown', function (e) {
        if (e.keyCode === 13 && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
      messageInput.focus();
      this.isEventHandlerAdded = true;
    }
  }
  showTypingIndicator(socket, receiver) {
    if (!this.isTyping) {
      this.isTyping = true;
      if (socket) {
        socket.send(JSON.stringify({ action: "typing", content: `<span></span><span></span><span></span>`, recipientId: receiver.id }));
      }
    }
  }
  hideTypingIndicator(socket, receiver) {
    if (this.isTyping) {
      this.isTyping = false;
      if (socket) {
        socket.send(JSON.stringify({ action: "typing", content: "", recipientId: receiver.id }));
      }
    }
  }
  close() {
    if (this.chatElement) {
      this.chatElement.remove();
    }
  }
}


const home = new Home();

const login = new Login();




export { routes, home, login, Chat };
