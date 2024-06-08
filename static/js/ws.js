import { Chat } from "./models.js";

let debounceTimeout;
const soundPath = '/static/sound/mixkit-long-pop-2358.wav';
const audio = new Audio('/static/sound/mixkit-long-pop-2358.wav');

function playSound() {
    const notifElement = document.getElementById('notif');
    const svgElement = notifElement.querySelector('svg');
    if (svgElement.classList.contains('on')) {
        audio.play();
    } else if (svgElement.classList.contains('off')) {
        audio.pause();
        audio.currentTime = 0;
    }
}

export function joinRoom(roomId, userInfos) {
    return new Promise((resolve, reject) => {
        const domainWithPort = `${window.location.hostname}:${window.location.port}`;
        console.log(domainWithPort);
        const ws = new WebSocket(
            `ws://${domainWithPort}/joinRoom/${roomId}?userId=${userInfos.id}&username=${userInfos.username}`
        );
        const logOut = document.getElementById("logOUT")
        console.log(logOut);
        logOut.addEventListener("click", function () {
            ws.close()
        })
        ws.onopen = async () => {
            console.log(`${userInfos.username} Connected to room ${roomId}`);
            // await setupCurrentConversations(ws, userInfos);
            await setupCurrentConversations(ws, userInfos);
        };
        ws.onmessage = async (message) => {
            const data = JSON.parse(message.data);
            if (data.action === "connexion" || data.action === "deconnexion") {
                if (roomId === 1) await updateOnlineUsers(ws, roomId, userInfos, data.action);
                console.log(document.querySelector(".user" + data.senderId));
                const status = document.querySelector(".user" + data.senderId)
                if (data.action === "deconnexion" && status) status.querySelector(".userStatus").classList.remove("online")
                if (data.action === "connexion" && status) status.querySelector(".userStatus").classList.add("online")
            }
            if (data.action === "message") {
                const currentConv = document.getElementById("current-conv");
                let clientId = data.senderId
                if (data.senderId == userInfos.id) clientId = data.recipientId
                displayMessage(data, userInfos, true);
                const previous = document.querySelector(".user" + clientId)
                console.log(previous.querySelector(".userStatus").classList);
                let user = await fetchUserById(clientId);
                user.id = user.id.toString();
                const userDiv = document.createElement("div");
                userDiv.className = `onlineUser user${user.id}`;
                userDiv.innerHTML = `
                <div class="userContainer">
                    <div class=userInfosContainer>
                        <div class="userImgContainer">
                            <img src="/static/images/prifimg.png" alt="${user.username}">
                        </div>
                        <div class="userStatus"></div> 
                        <div>${user.username}</div>
                    </div>
                    <div class="prevcontent">
                        <div class="msg-preview">${data.content.substring(0, 30)}</div>
                        <div  class="time-preview">${data.time}</div>
                    </div>
                </div>
                <div class="unread"></div>
                    `;
                currentConv.prepend(userDiv);
                let chatId
                const chat = document.querySelector(".chat")
                if (chat) chatId = chat.classList[1]
                console.log(userInfos.id, data.senderId);
                console.log(`${chatId},  chat${data.senderId},  ${chatId},  chat${data.recipientId}`);
                if (userInfos.id != data.senderId && (`${chatId}` !== `chat${data.senderId}` && `${chatId}` !== `chat${data.recipientId}`)){
                playSound();
                const previousUnread = previous.querySelector(".unread")
                console.log("prev", previousUnread);
                let unread = userDiv.querySelector(".unread")
                if (!previousUnread) {
                    unread.innerHTML = 1;
                } else{
                    unread.innerHTML = Number(previousUnread.innerHTML) + 1;
                }
                unread.style.display = "flex"
                }
                if (previous.querySelector(".userStatus").classList.contains("online")) userDiv.querySelector(".userStatus").classList.add("online")
                previous.remove();
                userDiv.addEventListener("click", function () {
                    let unread = userDiv.querySelector(".unread");
                    if (unread) {
                        unread.innerHTML = "";
                        unread.style.display = "none";
                    }
                    const existingChat = document.querySelector(".chat");
                    const chatClassForUser = `chat${user.id}`;
                    if (!existingChat || !existingChat.classList.contains(chatClassForUser)) {
                        if (existingChat) {
                            existingChat.remove();
                        }
                        const newChat = createChat(ws, userInfos, user);
                        setupScrollListener(newChat, userInfos, user);
                    }
                });
            }
            if (data.action === "typing") {
                console.log("Received:", data);
                const typingIndicator = document.querySelector(".typing-indicator");
                const chat = document.querySelector(".chat");
                console.log(chat.classList[1], data.senderId);
                if (chat){
                    if (chat.classList[1] === "chat" + data.senderId) typingIndicator.innerHTML = data.content;
                } 
            }
        };
        ws.onclose = () => {
            console.log(`Disconnected from room ${roomId}`);
        };
    });
}

async function updateOnlineUsers(socket, roomId, userInfos, status) {
    fetch(`/getClients/${roomId}`)
        .then((response) => response.json())
        .then((clients) => {
            //update user interface
            const userOnlineContainer = document.getElementById("onlineUser-container");
            userOnlineContainer.innerHTML = "";
            clients.forEach((client) => {
                if (client.username !== userInfos.username) {
                    let userDiv = document.querySelector(`.user${client.id}`)
                    console.log(userDiv);
                    if (userDiv) {
                        // if (status === "deconnexion") userDiv.querySelector(".userStatus").classList.remove("online")
                        // if (status === "connexion") userDiv.querySelector(".userStatus").classList.add("online")
                        return
                    }
                    userDiv = document.createElement("div");
                    userDiv.className = `onlineUser user${client.id}`;
                    userDiv.innerHTML = `
                    <div class="userContainer">
                        <div class=userInfosContainer>
                            <div class="userImgContainer">
                                <img src="/static/images/prifimg.png" alt="${client.username}">
                            </div>
                            <div class="userStatus online"></div> 
                            <div>${client.username}</div>
                        </div>
                    </div>
                    `;
                    // userDiv.innerHTML = `
                    //     <div class="userContainer">
                    //         <img src="/static/images/prifimg.png" alt="">
                    //     </div>
                    //     <div class="userStatus online"></div>
                    //     ${client.username}
                    // `;
                    let close = null;
                    userOnlineContainer.appendChild(userDiv);
                    userDiv.addEventListener("click", function () {
                        const existingChat = document.querySelector(".chat");
                        const chatClassForUser = `chat${client.id}`;
                        if (!existingChat || !existingChat.classList.contains(chatClassForUser)) {
                            if (existingChat) {
                                existingChat.remove();
                            }
                            const newChat = createChat(socket, userInfos, client, client);
                            setupScrollListener(newChat, userInfos, client);
                        }
                    });
                }
            });
        })
        .catch((error) => console.error("Error fetching clients:", error));
}

function generateRoomId(id1, id2) {
    return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
}

function displayMessage(message, user, newMessage, offset) {
    let chatId
    const chat = document.querySelector(".chat")
    if (chat) chatId = chat.classList[1]
    if ("chat" + message.senderId !== chatId && "chat" + message.recipientId !== chatId) return
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "new");
    messageElement.id = message.id;
    if (user.id == message.senderId)
        messageElement.classList.add("message-personal");
    messageElement.textContent = message.content;
    const messageContainer = document.querySelector(".messages-content");
    if (messageContainer) {
        if (newMessage) {
            messageContainer.appendChild(messageElement);
            if (messageContainer)
                messageContainer.scrollTop = messageContainer.scrollHeight;
        } else {
            messageContainer.prepend(messageElement);
        }
    }
    setDate(message.time, message.username, newMessage);
    if (offset === 0) messageContainer.scrollTop = messageContainer.scrollHeight;
}

function setDate(date, sender, newMessage) {
    const timestamp = document.createElement("div");
    timestamp.classList.add("timestamp");
    timestamp.textContent = date + ", by @" + sender;
    const messageContainer = document.querySelector(".messages-content");
    if (messageContainer) {
        if (newMessage) {
            const lastMessage = document.querySelector(".message:last-child");
            if (lastMessage) lastMessage.appendChild(timestamp);
        } else {
            const firstMessage = document.querySelector(".message:first-child");
            if (firstMessage) firstMessage.appendChild(timestamp);
        }
    }
}

function fetchChatHistory(sender, recipient, offset, newMessage) {
    fetch(`/chatHistory?sender=${sender.id}&recipient=${recipient.id}&offset=${offset}`)
        .then((response) => response.json())
        .then((messages) => {
            if (Array.isArray(messages) && messages.length) {
                messages.forEach((message) => {
                    displayMessage(message, sender, newMessage, offset);
                });
            }
        });
}

function debouncedFetchChatHistory(sender, recipient, offset, newMessage) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        fetchChatHistory(sender, recipient, offset, newMessage);
    }, 300); // 300ms delay
}

function createChat(socket, userInfos, client) {
    const chat = new Chat(client);
    let typingTimer;
    const doneTypingInterval = 3000; // 3 secondes
    chat.display(socket, userInfos, client);
    const messageInput = document.querySelector(".message-input");
    messageInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        chat.showTypingIndicator(socket, client);
        typingTimer = setTimeout(() => {
            chat.hideTypingIndicator(socket, client);
        }, doneTypingInterval);
    });    
    const close = document.querySelector(".close");
    close.addEventListener("click", function () {
        chat.close();
    });
    fetchChatHistory(userInfos, client, 0);
    return chat;
}

function setupScrollListener(chat, userInfos, client) {
    const messageContainer = document.querySelector(".messages-content");
    let offset = 0;
    let totalMsg;
    let firstMsgId;
    fetch(`/firstMessage?senderId=${userInfos.id}&recipientId=${client.id}`)
        .then((response) => response.json())
        .then((data) => {
            firstMsgId = data;
        })
        .catch((error) => console.error("Error:", error));
        messageContainer.addEventListener("scroll", function () {
        const lastMsg = document.querySelector(".message");
        if (lastMsg.id == firstMsgId) return;
        if (this.scrollTop <= 0) {
            offset += 10;
            fetchChatHistory(userInfos, client, offset, false);
            messageContainer.scrollTop = lastMsg.getBoundingClientRect().top;
        }
    });
}


async function getLastMessagesForUser(userId) {
    console.log(userId);
    return fetch(`/lastConv?userId=${userId}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((messages) => {
            console.log("Last messages in each conversation:", messages);
            return messages;
        })
        .catch((error) => {
            console.error(
                "There has been a problem with your fetch operation:",
                error
            );
        });
}

async function fetchUserById(clientId) {
    try {
        const response = await fetch(`/user?userId=${clientId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

async function setupCurrentConversations(ws, userInfos) {
    const currentConv = document.getElementById("current-conv");
    try {
        const currentMsg = await getLastMessagesForUser(userInfos.id);
        if (!currentMsg) return
        console.log(currentMsg);
        for (const msg of currentMsg) {
            if (msg.senderId != msg.recipientId) {
                let clientId = userInfos.id != msg.senderId ? msg.senderId : msg.recipientId;
                let user = await fetchUserById(clientId);
                user.id = user.id.toString();
                console.log(document.querySelectorAll(".user" + user.id));
                const online = document.querySelector(".user" + user.id)
                const userDiv = document.createElement("div");
                userDiv.classList.add("onlineUser", `user${user.id}`);
                userDiv.innerHTML = `
                <div class="userContainer">
                    <div class=userInfosContainer>
                        <div class="userImgContainer">
                            <img src="/static/images/prifimg.png" alt="${user.username}">
                        </div>
                        <div class="userStatus"></div> 
                        <div>${user.username}</div>
                    </div>
                    <div class="prevcontent">
                    <div class="msg-preview">${msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content}</div>
                        <div  class="time-preview">${msg.time}</div>
                    </div>
                </div>
                `;
                currentConv.appendChild(userDiv);
                if (online) {
                    userDiv.querySelector(".userStatus").classList.add("online")
                    online.remove();
                }

                userDiv.addEventListener("click", function () {
                    const existingChat = document.querySelector(".chat");
                    console.log("this is ", existingChat);
                    const chatClassForUser = `chat${user.id}`;
                    if (!existingChat || !existingChat.classList.contains(chatClassForUser)) {
                        if (existingChat) {
                            existingChat.remove();
                        }
                        const newChat = createChat(ws, userInfos, user);
                        setupScrollListener(newChat, userInfos, user);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error setting up current conversations:', error);
    }
}