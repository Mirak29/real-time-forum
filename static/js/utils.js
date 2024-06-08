import { routes, home } from "./models.js";
const navigateTo = (url, data) => {
    history.pushState(null, null, url);
    router(data);
};
const handleEror = statusCode => {
    console.log('LOLOLO');
    if (statusCode == 404) {
        home.togleBody()
        home.aplyHtml()
        home.elements.popPupArea.style.display = 'flex';
        home.elements.popPupArea.classList.add("error");    
        home.elements.popPupArea.innerHTML = '<h1>404 Errors</h1>'
        home.lunchListeners()
    }

}
const router = async data => {
    if (location.pathname == "/") {
        navigateTo("/home")
        return
    }
    let match = routes["/" + location.pathname.split('/')[1]]
    if (!match) {
        handleEror(404)
        return
    }
    match(data)
}
const fetchData = async (url,) => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur de réseau: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return { error: error.message };
    }
}
const TokenAvailable = async () => {
    // let token = document.cookie.split('=')[0]
    // console.log(document.cookie);
    let responseContent
    await fetch("/loginVerif", {
        method: 'GET',
        headers: {
            'Content-Type': 'text/plain',
            'purpose': "tokenVerification"
        },
    }).then(response => {
        if (!response.ok) {
            handleEror(response.status);
            throw new Error('Network response was not ok');
        }
        return response.json()  // or response.text() if your server returns plain text
    }).then(data => {
        responseContent = data
    }).catch(error => {
        return error
    });
    return responseContent.haveSession;


}

const sendFormData = async (event, purpose) => {
    console.log();
    var formData = new FormData(event.target)
    var formDataObject = {};
    let responseData, errorf
    formData.forEach((value, key) => {
        formDataObject[key] = value;
        console.log(key, value);
    });
    // console.log(formDataObject);
    await fetch('/loginVerif', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // ou 'application/json' selon le type de données que vous envoyez
            'purpose': purpose
        },
        body: JSON.stringify(formDataObject),

    })
        .then(response => {
            if (!response.ok) {
                handleEror(response.status)
                return
            }
            return response.json().catch(() => responseData = { error: null })
        })
        .then(data => responseData = data)

    return responseData
}
export { router, handleEror, navigateTo, TokenAvailable, sendFormData }