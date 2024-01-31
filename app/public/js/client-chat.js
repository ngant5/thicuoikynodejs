const socket = io();
const userInformation = {
    room: "", // initialize with an empty room
    username: "", // initialize with an empty username
};

document.getElementById("form-messages").addEventListener('submit', (e) => {
    e.preventDefault();
    const messageText = document.getElementById("input-messages").value;

    const acknowledgements = (errors) => {
        if (errors) {
            return alert('Invalid message');
        }
        console.log("Message sent successfully");
    };

    socket.emit("send message from client to server", messageText, acknowledgements);
});

socket.on("send message from server to client", (message) => {
    console.log('Message:', message);

    const { createAt, messagesText, username } = message;
    const htmlContent = document.getElementById("app__messages").innerHTML;
    const messagesElement = `
        <div class="message-item">
            <div class="message__row1">
                <p class="message__name">${username}</p>
                <p class="message_date">${createAt}</p>
            </div>
            <div class="message__row2">
                <p class="message__content">
                    ${messagesText}
                </p>
            </div>
        </div>
    `;
    let contentRender = htmlContent + messagesElement;
    document.getElementById("app__messages").innerHTML = contentRender;
    document.getElementById("input-messages").value = "";
});

document.getElementById("btn-share-location").addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert("The browser does not support geolocation");
    }
    navigator.geolocation.getCurrentPosition((position) => {
        console.log("position: ", position);
        const { latitude, longitude } = position.coords;
        socket.emit("share location from client to server", {
            latitude,
            longitude,
        });
    });
});

socket.on("share location from server to client", (data) => {
    const { createAt, messagesText, username } = data;

    const htmlContent = document.getElementById("app__messages").innerHTML;
    const messagesElement = `
        <div class="message-item">
            <div class="message__row1">
                <p class="message__name">${username}</p>
                <p class="message_date">${createAt}</p>
            </div>
            <div class="message__row2">
                <p class="message__content">
                    <a href="${messagesText}" target="_blank">
                        Location shared by ${username}
                    </a>
                </p>
            </div>
        </div>
    `;
    let contentRender = htmlContent + messagesElement;
    document.getElementById("app__messages").innerHTML = contentRender;
});

const queryString = location.search;
const params = Qs.parse(queryString, {
    ignoreQueryPrefix: true,
});

const { room, username } = params;
userInformation.room = room; // update userInformation with the room
userInformation.username = username; // update userInformation with the username
socket.emit("join room from client to server", userInformation);

document.getElementById('app__title').innerHTML = room;

socket.on("send user list from server to client", (userList) => {
    console.log("userList : ", userList);
    let contentHtml = "";
    userList.map((user) => {
        contentHtml += `
        <li class="app__item-user">
            ${user.username}
        </li>
        `;
    });
    document.getElementById("app__list-user--content").innerHTML = contentHtml;
});
