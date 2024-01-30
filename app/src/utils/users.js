let userList = [
    {
        id : "1",
        username : "NTN",
        room : "FE01",
    },
    {
        id : "2",
        username : "NTK",
        room : "FE02",
    }
];

const addUser = (newUser) => userList = [...userList, newUser];

const getUserList = (room) => userList.filter((user) => user.room === room);

const removeUser = (id) => userList = userList.filter((user) => user.id !== id);

module.exports = {
    getUserList, 
    addUser,
    removeUser,
}