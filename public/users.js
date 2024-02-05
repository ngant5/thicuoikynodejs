"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUser = exports.getUser = exports.addUser = exports.getUserList = void 0;
let userList = [];
const generateUsername = () => {
    // Tạo một tên người dùng ngẫu nhiên
    return "Guest" + Math.floor(Math.random() * 1000);
};
const addUser = (newUser) => {
    if (!newUser.username) {
        newUser.username = generateUsername();
    }
    userList = [...userList, newUser];
    return newUser;
};
exports.addUser = addUser;
const getUserList = (room) => userList.filter((user) => user.room === room);
exports.getUserList = getUserList;
const getUser = (id) => userList.find((user) => user.id === id);
exports.getUser = getUser;
const removeUser = (id) => {
    userList = userList.filter((user) => user.id !== id);
};
exports.removeUser = removeUser;
