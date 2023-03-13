const messageContainer = $('.messages');
const inputField = $('.input input');
const sendButton = $('.input button');

sendButton.on('click', (e) => {
  e.preventDefault();
  sendMessage();
});

function sendMessage() {
  const message = inputField.val().trim();
  if (message === '') return;

  const messageElement = $('<p>').text(message);

  messageContainer.append(messageElement);

  inputField.val('');
  messageContainer.scrollTop(messageContainer.prop('scrollHeight'));

  $.ajax({
    url: '/send',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ message: message }),
    success: function(response) {
      console.log(response);
    }
  });
}

inputField.on('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function receiveMessages() {
  $.ajax({
    url: '/receive',
    type: 'GET',
    contentType: 'application/json',
    success: function(messages) {
      messages.forEach(function(message) {
        const messageElement = $('<p>').text(message.message);
        messageContainer.append(messageElement);
      });
      messageContainer.scrollTop(messageContainer.prop('scrollHeight'));
    }
  });
}

setInterval(receiveMessages, 1000);
