const formatTime = require('date-format');

interface Message {
    messagesText: string;
    username: string;
    createAt: string;
}

const createMessages = (messagesText: string, username: string): Message => {
    return {
        messagesText,
        username,
        createAt: formatTime("dd/MM/yyyy - hh:mm:ss", new Date()),
    };
};

export { createMessages };