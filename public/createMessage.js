"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessages = void 0;
const formatTime = require('date-format');
const createMessages = (messagesText, username) => {
    return {
        messagesText,
        username,
        createAt: formatTime("dd/MM/yyyy - hh:mm:ss", new Date()),
    };
};
exports.createMessages = createMessages;
