const socket = io('http://localhost:9090');

const form = document.getElementById('send-container');
const msgInput = document.getElementById('msgInput');
const msgContainer = document.querySelector('.container');
var msgNotify = new Audio('../media/notify.mp3');

msgInput.addEventListener('input', () => {
    // Adjust height to fit content
    msgInput.style.height = 'auto';
    msgInput.style.height = (msgInput.scrollHeight) + 'px';
    
    // Scroll to the bottom if the content exceeds 4 lines
    const lineCount = (msgInput.value.match(/\n/g) || []).length + 1;
    if (lineCount > 4) {
        msgInput.scrollTop = msgInput.scrollHeight;
    }
});

//when user receive message from someone
socket.on('receive', msg => {
    append(`${msg.name}: ${msg.message}`, 'left');

})

//when you press send button
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = msgInput.value;

    if(isValid(msg)) {
        append(`${msg}`, 'right');
        socket.emit('send', msg);
    }
    msgInput.value = '';
    msgInput.style.height = 'auto';
    msgInput.focus();
});


// when you press Enter key, the message will be sent
// basically what this code does is, it envokes the "send" button (or the form submission event), as soon as it detects the Enter Key
msgInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();  // Prevents a new line from being added
        form.dispatchEvent(new Event('submit'));
    }
})

//function to add your message in the chatbox
// OR function to send message to the chatroom
const append = (msg, position) => {
    const msgElement = document.createElement('div');
    msgElement.innerText = msg;
    msgElement.classList.add('msg');
    msgElement.classList.add(position);
    msgContainer.append(msgElement);

    if(position == 'left') msgNotify.play();
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

// when new user joins the chat
const userJoined = (msg) => {
    const msgElement = document.createElement('div');
    msgElement.innerText = msg;
    msgElement.classList.add('new-user');
    msgElement.classList.add('center');

    msgContainer.append(msgElement);
}
socket.on('user-joined', name => {
    userJoined(`${name} joined the chat`);
})

socket.on('user-leave', name => {
    if(name != null || name != undefined) userJoined(`${name} left the chat`);
})



//before joining the chatroom, user must enter his/her name
let name;
while(!name || name.length == 0) {
    name = prompt("Enter your name to join the chatroom");
    
    if(name === null) alert("You must enter a valid name");
    else name = name.trim();
}
socket.emit('new-user-joined', name);
msgInput.focus(); // Make it ready for the user to start typing as soon as the chatroom loads


// function to check if the input msg is a valid msg or just some spaces or nothing
function isValid(str) {
    if(str.length == 0) return false;
    const set = new Set();
    for (const char of str) {
        set.add(char);
    }
    if(set.size == 1 && str.charAt(0) == ' ') return false;
    return true;
}