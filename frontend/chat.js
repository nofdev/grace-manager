const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const resultDiv = document.getElementById('result');

function sendMessage() {
    const message = input.value;

    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [{role: 'user', content: message}],
    }

    // Send HTTP GET request to API endpoint, and print result in response
    // Send to Gateway API DO NOT Sent to OpenAI API, Only Dev environment
    fetch(`https://api.openai.com/v1/chat/completions`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer `
            },
            body: JSON.stringify(requestBody)
        }
    )
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