const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const resultDiv = document.getElementById('result');
const loading = document.getElementById('loading');

// User input focus
input.focus();

// Initial loading do not display
loading.style.display = "none";

function sendMessage() {
    // if input.value is empty, return
    if (input.value === '') return;

    // When user click send button, loading display and send button hide
    loading.style.display = "block";
    sendBtn.style.display = "none";
    input.style.display = "none";

    // The user message of user input
    let userMessage = input.value;

//OpenAI Chat API request body
    let requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [{role: 'user', content: userMessage}],
        temperature: 0.8,
    }

    // Control input message to display
    const inputElement = document.createElement('pre');
    inputElement.id = "input-message"
    inputElement.textContent = userMessage
    resultDiv.appendChild(inputElement);

    // Send HTTP GET request to API endpoint, and print result in response
    // Send to Gateway API DO NOT Sent to OpenAI API, Only Dev environment
    fetch(`https://api.openai.com/v1/chat/completions`, {
        method: 'POST', headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer sk-`
        }, body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(result => {
            if (!result) {
                throw new Error('Invalid response format')
            }
            // This is the response from OpenAI API
            const resultElement = document.createElement('pre');
            resultElement.textContent = result.choices[0].message.content;
            resultDiv.appendChild(resultElement);
            resultDiv.appendChild(document.createElement('br'));

            // TODO Fix context error
            // requestBody.messages.push({role: 'user', content: userMessage})
            // requestBody.messages.push(result.choices[0].message)
        })
        .catch(error => console.error(error))
        .finally(() => {
            // Control loading display and send button display
            loading.style.display = "none";
            sendBtn.style.display = "block";
            input.style.display = "block";
            input.focus();
        });

    // Clear user input
    input.value = '';
}


// When user click send button, call sendMessage function
sendBtn.addEventListener('click', sendMessage);

// When user press Enter key, call sendMessage function, and new line function is disable
// When user press Enter key and Shift key, new line function is enable
const textarea = document.getElementById('input');
textarea.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        // If press Enter and not Shift, submit form
        event.preventDefault(); // Disable default submit event
        // Submit logic
        sendMessage();
    } else if (event.key === 'Enter' && event.shiftKey) {
        // If press Enter and Shift, new line
        event.preventDefault(); // Disable default new line event
        const startPos = this.selectionStart;
        const endPos = this.selectionEnd;
        const value = this.value;
        this.value = value.substring(0, startPos) + '\n' + value.substring(endPos, value.length);
        this.selectionStart = this.selectionEnd = startPos + 1;
    }
})
