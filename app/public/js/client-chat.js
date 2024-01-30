//yeu cau server ket noi voi client
const socket = io();

document.getElementById("form-messages").addEventListener('submit' , (e) =>{
    e.preventDefault(); 
    const messageText = document.getElementById("input-messages").value;
    const acknowledgements = (errors) => {
        if(errors){
            return alert('tin nhan khong hop le');
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