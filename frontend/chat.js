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
                'Authorization': `Bearer sk-`
            },
            body: JSON.stringify(requestBody)
        }
    )
        .then(response => response.json())
        .then(result => {
            if (!result) {
                throw new Error('Invalid response format')
            }
            const resultElement = document.createElement('p');
            resultElement.textContent = result.choices[0].message.content;

            resultDiv.appendChild(resultElement);
        })
        .catch(error => console.error(error));

    input.value = '';
}

sendBtn.addEventListener('click', sendMessage);

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
})