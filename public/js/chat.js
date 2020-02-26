const socket = io();

// Elements
const messageForm = document.getElementById("messageForm");
const messageFormInput = messageForm.querySelector("input");
const messageFormButton = messageForm.querySelector("button");
const locationSendButton = document.getElementById("locationMessage");
const messages = document.getElementById("messages");

// Templates 
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationMessageTemplate = document.getElementById("location-message-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar_template").innerHTML;

// username and room name 
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {
    // New Message element
    const newMessage = messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin= parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visable height 
    const visableHeight = messages.offsetHeight

    // Height of message container
    const containerHeight = messages.scrollHeight

    // How far i have scrolled 
    const scrollOffset = messages.scrollTop + visableHeight

    if (containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight;
    }
}

socket.on("message",(message) => {
    
    // console.log(message);
    const html = Mustache.render(messageTemplate,
        {
            username:message.username,
            message:message.text,
            createdAt:moment(message.createdAt).format("h:mm a")
        });
    
    messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
});

socket.on("locationMessage",(location) => {
    console.log(location);
    const html = Mustache.render(locationMessageTemplate,
        {   
            username:location.username,
            location:location.url,
            createdAt:moment(location.createdAt).format("h:mm a")
        }
        );
    messages.insertAdjacentHTML("beforeend",html);
    autoscroll();
})

socket.on("roomData",({room,users}) => {
    const html = Mustache.render(sidebarTemplate,{room,users})

    document.querySelector("#sidebar").innerHTML= html
})

document.getElementById("messageForm").addEventListener("submit",(e) => {
    e.preventDefault();
    
    messageFormButton.setAttribute("disabled","disabled")
    
    const textMessage = e.target.elements.textMessage.value;
    
    socket.emit("sendMessage",textMessage,(message,error) => {
        
        if(error){
            alert(error)
        }
        messageFormButton.removeAttribute("disabled");
        messageFormInput.value = ""
        messageFormInput.focus()

        console.log(message)
    });
});

locationSendButton.addEventListener("click",() => {
    if(!navigator.geolocation){
        return alert("Your browser doesn't support geolocation please update your browser or use other latest browse.");
    }
    
    locationSendButton.setAttribute("disabled","disabled")

    navigator.geolocation.getCurrentPosition((postion) => {
        const latitude = postion.coords.latitude;
        const longitude = postion.coords.longitude;
        socket.emit("sendLocation",{latitude,longitude},(message) => {

            locationSendButton.removeAttribute("disabled");
            console.log(message);
        });
    })
})

socket.emit("join",({username,room}),(error) => {
    if(error){
        alert(error);
        location.href = "/"
    }
})