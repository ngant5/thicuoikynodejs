// client.ts
import { io, Socket } from 'socket.io-client';
import * as Qs from 'qs';

const socket: Socket = io();

const userInformation = {
    room: "", // initialize with an empty room
    username: "", // initialize with an empty username
};

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const formMessages = document.getElementById("form-messages") as HTMLFormElement;
        const inputMessages = document.getElementById("input-messages") as HTMLInputElement;
        const appMessages = document.getElementById("app__messages") as HTMLElement;
        const btnShareLocation = document.getElementById("btn-share-location") as HTMLElement;
        const appTitle = document.getElementById('app__title') as HTMLElement;
        const userListContent = document.getElementById("app__list-user--content") as HTMLElement;

        formMessages?.addEventListener('submit', (e) => {
            e.preventDefault();
            const messageText = inputMessages?.value;

            const acknowledgements = (errors: string | null) => {
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
            appMessages.innerHTML += messagesElement;
            inputMessages.value = "";
        });

        btnShareLocation?.addEventListener('click', () => {
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
            appMessages.innerHTML += messagesElement;
        });

        const queryString = location.search;
        const params = Qs.parse(queryString, {
            ignoreQueryPrefix: true,
        });

        const { room, username } = params;
        userInformation.room = room as string; // update userInformation with the room
        userInformation.username = username as string; // update userInformation with the username
        socket.emit("join room from client to server", userInformation);

        appTitle.innerHTML = room as string;

        socket.on("send user list from server to client", (userList: { username: string }[]) => {
            console.log("userList : ", userList);
            let contentHtml = "";
            userList.map((user) => {
                contentHtml += `
                <li class="app__item-user">
                    ${user.username}
                </li>
                `;
            });
            userListContent.innerHTML = contentHtml;
        });
    });
}
