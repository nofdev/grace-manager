// This file is used to send and receive messages from the server by using the fetch API.

const messageContainer = document.querySelector('.messages');
const inputField = document.querySelector('.input input');
const sendButton = document.querySelector('.input button');

sendButton.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
});

function sendMessage() {
    const message = inputField.value.trim();
    if (message === '') return;

    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);

    inputField.value = '';
    messageContainer.scrollTop = messageContainer.scrollHeight;

    fetch('/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({message: message})
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
}

inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function receiveMessages() {
    fetch('/receive', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(messages => {
            messages.forEach(function (message) {
                const messageElement = document.createElement('p');
                messageElement.textContent = message.message;
                messageContainer.appendChild(messageElement);
            });
            messageContainer.scrollTop = messageContainer.scrollHeight;
        })
        .catch(error => console.error(error));
}

setInterval(receiveMessages, 1000);
