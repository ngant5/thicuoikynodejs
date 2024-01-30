//yeu cau server ket noi voi client
const socket = io();

document.getElementById("form-messages").addEventListener('submit' , (e) =>{
    e.preventDefault(); 
    const messageText = document.getElementById("input-messages").value;
    const acknowledgements = (errors) => {
        if(errors){
            return alert('tin nhan khong hop le');2
        }
        console.log("send sucessfully");
    };

    socket.emit("send message from client to server" , 
    messageText,
    acknowledgements
    );
});

socket.on("send message from server to client", (messageText) =>{
    console.log(messageText);
});

//gui vi tri
document.getElementById("btn-share-location").addEventListener('click' , ()=>{
    if(!navigator.geolocation){
        return alert("trinh duyet dang dung khong ho tro tim vi tri");
    }
    navigator.geolocation.getCurrentPosition((position) =>{
        console.log("position: ", position);
        const {latitude, longitude} = position.coords;
        socket.emit("share location from client to server",  {
            latitude,
            longitude,
        })
    });
});

socket.on("share location from server to client" , (linkLocation) =>{
    console.log("linkLocation : ", linkLocation);
})

//xu ly query string
const queryString = location.search;

const params = Qs.parse(queryString , {
    ignoreQueryPrefix: true,
});

const {room, username} = params;

socket.emit("join room from client to server" , {room, username});

//xu ly user list
socket.on("send user list from server to client" , (userList) =>{
    console.log("userList : ", userList);
})