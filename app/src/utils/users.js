let userList = [
    // {
    //     id : "1",
    //     username : "NTN",
    //     room : "FE01",
    // },
    // {
    //     id : "2",
    //     username : "NTK",
    //     room : "FE02",
    // },
];
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

const getUserList = (room) => userList.filter((user) => user.room === room);
const getUser = (id) => userList.find((user) => user.id === id) || {};

const removeUser = (id) => {
    userList = userList.filter((user) => user.id !== id);
};

module.exports = {
    getUserList, 
    addUser,
    getUser,
    removeUser,
};