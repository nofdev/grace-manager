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
}

inputField.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
