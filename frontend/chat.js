const userIpt = document.getElementById('input');
const sendBtn = document.getElementById('send');
const resultDiv = document.getElementById('result');
const loadingBdr = document.getElementById('loading');
// import key for testing purpose only (not for production)
// import {SK} from './key.js';

// User input focus
userIpt.focus();

// Initial loading do not display
loadingBdr.style.display = "none";

// OpenAI Chat API request body
let requestBody = {
    model: 'gpt-3.5-turbo',
    messages: [],
    temperature: 0.8,
}

function sendMessage() {
    // if input.value is empty, return
    if (userIpt.value === '') return;

    // When user click send button, loading display and send button hide
    loadingBdr.style.display = "block";
    sendBtn.style.display = "none";
    userIpt.style.display = "none";

    // The user message of user input
    let userMessage = userIpt.value;


    // Control input message to display
    const inputElement = document.createElement('pre');
    inputElement.id = "input-message"
    inputElement.textContent = userMessage
    resultDiv.appendChild(inputElement);

    // Max length is 6, when 6 reached shift the first two message
    // After testing, 6 context lengths are moderate
    if (requestBody.messages.length > 6) {
        requestBody.messages.splice(0, 2);
    }

    // Push user message to requestBody.messages array for context
    requestBody.messages.push({role: 'user', content: userMessage})

    // Send HTTP GET request to API endpoint, and print result in response
    // Send to Gateway API DO NOT Sent to OpenAI API, Only Dev environment
    fetch(`https://api.jiasir.io:3000/chat`, {
        method: 'POST', headers: {
            'Content-Type': 'application/json',
            // 'Authorization': SK,
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

            // Push assistant message to requestBody.messages array for context
            requestBody.messages.push(result.choices[0].message)
        })
        .catch(error => console.error(error))
        .finally(() => {
            // Control loading display and send button display
            loadingBdr.style.display = "none";
            sendBtn.style.display = "block";
            userIpt.style.display = "block";
            userIpt.focus();
        });

    // Clear user input
    userIpt.value = '';
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

// Format code content from API response
function formatApiContent(content) {
    let codeBlock = false;
    let lines = content.split('\n');
    let formattedContent = '';

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line === '```') {
            if (codeBlock) {
                formattedContent += '</code>';
            } else {
                formattedContent += '<code>';
            }
            codeBlock = !codeBlock;
        } else {
            if (codeBlock) {
                formattedContent += line + '\n';
            } else {
                formattedContent += '<p>' + line + '</p>';
            }
        }
    }

    return formattedContent;
}
