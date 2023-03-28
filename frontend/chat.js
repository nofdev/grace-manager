const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const resultDiv = document.getElementById('result');

function sendMessage() {
    const message = input.value;

    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    // Send HTTP GET request to API endpoint, and print result in response
    fetch(`/api/sendMessage?message=${message}`)
        .then(response => response.json())
        .then(result => {
            const resultElement = document.createElement('p');
            resultElement.textContent = result.message;
            resultDiv.appendChild(resultElement);
        })
        .catch(error => console.error(error));

    input.value = '';
}

sendBtn.addEventListener('click', sendMessage);