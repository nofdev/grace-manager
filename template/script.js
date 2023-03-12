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

  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
    }
  };
  xhttp.open('POST', 'http://localhost:8080/send', true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.send('message=' + message);
}

inputField.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function receiveMessages() {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const messages = JSON.parse(this.responseText);
      for (let i = 0; i < messages.length; i++) {
        const messageElement = document.createElement('p');
        messageElement.textContent = messages[i];

        messageContainer.appendChild(messageElement);
      }
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  };
  xhttp.open('GET', 'http://localhost:8080/receive', true);
  xhttp.send();
}

setInterval(receiveMessages, 1000);
