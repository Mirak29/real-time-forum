import { navigateTo , TokenAvailable} from "./utils.js"
import {home, login} from "./models.js"
import { joinRoom } from './ws.js';
const OriginHandler = ()=> {
    if (!TokenAvailable){
        navigateTo("/Login")
        return
    }
    navigateTo("/")
}
const HomeHandler =async  (toggleBody) => {
    if (!( await TokenAvailable())){
        navigateTo("/login")
        return
    }
    home.togleBody(toggleBody)
    home.aplyHtml()
    home.NotifListener()
    home.lunchListeners()
    home.createCategories()
    home.GetPost()
    const userInfos = await home.GetUserInfos()
    joinRoom(1, userInfos)
    console.log(await home.GetUserInfos());
}
const LoginHandler = async () => {
    if (await TokenAvailable()){
        navigateTo("/home")
        return
    }
    console.log(document.cookie);
    login.togleBody()
    login.aplyHtml()
    const signInBtn = document.getElementById("signIn");
    const signUpBtn = document.getElementById("signUp");
    const fistForm = document.getElementById("form1");
    const secondForm = document.getElementById("form2");
    const container = document.querySelector(".container");

    signInBtn.addEventListener("click", () => {
        container.classList.remove("right-panel-active");
    });

    signUpBtn.addEventListener("click", () => {
        container.classList.add("right-panel-active");
    });
    login.lunchListeners()
    fistForm.addEventListener("submit", (e) => e.preventDefault());
    secondForm.addEventListener("submit", (e) => e.preventDefault());
}

export { OriginHandler, HomeHandler, LoginHandler }