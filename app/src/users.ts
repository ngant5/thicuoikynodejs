interface User {
    id: string;
    username: string;
    room: string;
}

let userList: User[] = [];

const generateUsername = (): string => {
    // Tạo một tên người dùng ngẫu nhiên
    return "Guest" + Math.floor(Math.random() * 1000);
};

const addUser = (newUser: User): User => {
    if (!newUser.username) {
        newUser.username = generateUsername();
    }

    userList = [...userList, newUser];
    return newUser;
};

const getUserList = (room: string): User[] => userList.filter((user) => user.room === room);
const getUser = (id: string): User | undefined => userList.find((user) => user.id === id);

const removeUser = (id: string): void => {
    userList = userList.filter((user) => user.id !== id);
};

export { getUserList, addUser, getUser, removeUser };
