"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// client.ts
const socket_io_client_1 = require("socket.io-client");
const Qs = __importStar(require("qs"));
const socket = (0, socket_io_client_1.io)();
const userInformation = {
    room: "", // initialize with an empty room
    username: "", // initialize with an empty username
};
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const formMessages = document.getElementById("form-messages");
        const inputMessages = document.getElementById("input-messages");
        const appMessages = document.getElementById("app__messages");
        const btnShareLocation = document.getElementById("btn-share-location");
        const appTitle = document.getElementById('app__title');
        const userListContent = document.getElementById("app__list-user--content");
        formMessages === null || formMessages === void 0 ? void 0 : formMessages.addEventListener('submit', (e) => {
            e.preventDefault();
            const messageText = inputMessages === null || inputMessages === void 0 ? void 0 : inputMessages.value;
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
        btnShareLocation === null || btnShareLocation === void 0 ? void 0 : btnShareLocation.addEventListener('click', () => {
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
        userInformation.room = room; // update userInformation with the room
        userInformation.username = username; // update userInformation with the username
        socket.emit("join room from client to server", userInformation);
        appTitle.innerHTML = room;
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
            userListContent.innerHTML = contentHtml;
        });
    });
}
