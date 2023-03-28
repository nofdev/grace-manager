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
    const message = input.value;

    // OpenAI Chat API request body
    const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [{role: 'user', content: message}],
    }

    // Control input message to display
    const resultElement = document.createElement('h5');
    resultElement.textContent = message
    resultDiv.appendChild(resultElement);

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
            const resultElement = document.createElement('pre');
            resultElement.textContent = result.choices[0].message.content;

            resultDiv.appendChild(resultElement);
            resultDiv.appendChild(document.createElement('br'));
        })
        .catch(error => console.error(error))
        .finally(() => {
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
textarea.addEventListener('keydown', function(event) {
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
