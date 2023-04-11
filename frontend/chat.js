// import * as https from "https";

const userIpt = document.getElementById('input');
const sendBtn = document.getElementById('send');
const resultDiv = document.getElementById('result');
const loadingBdr = document.getElementById('loading');

// User input focus
userIpt.focus();

// Initial loading do not display
loadingBdr.style.display = "none";

// OpenAI Chat API request body
let requestBody = {
    model: 'gpt-3.5-turbo',
    messages: [],
    temperature: 0.8,
    stream: true
}

let responseStream;
let abortController = new AbortController();


function sendMessage() {

    if (abortController) {
        abortController.abort();
    }
    abortController = new AbortController

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
    fetch(`http://172.104.116.220:8080/v1/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // Send request body to Gateway API
        body: JSON.stringify(requestBody),
        signal: abortController.signal, // pass the signal to the fetch request
    })
        // Get response from Gateway API
        .then((response) => {
            // Check if response is ok
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            // Create a ReadableStream object from the response body
            const reader = response.body.getReader();
            // Use TextDecoder to decode the stream into a string
            const decoder = new TextDecoder();
            let result = "";
            // Read the stream
            return reader.read().then(function readStream({ done, value }) {
                // If the stream is done, return the result
                if (done) {
                    // All chunks have been read, parse the JSON result
                    try {
                        const jsonResult = JSON.parse(result);
                        // This is the response from OpenAI API
                        // Create a resultElement to display the assistant message
                        const resultElement = document.createElement("pre");
                        // The assistant message of OpenAI API response
                        resultElement.textContent = jsonResult.choices[0].message.content;
                        // Append assistant message to resultDiv
                        resultDiv.appendChild(resultElement);
                        resultDiv.appendChild(document.createElement("br"));

                        // Push assistant message to requestBody.messages array for context
                        requestBody.messages.push(jsonResult.choices[0].message);

                        return jsonResult;
                    } catch (error) {
                        console.error("parse json error: ", error);
                    }
                }
                // Convert the current chunk to a string and append it to the result variable
                result += decoder.decode(value, { stream: !done });
                // Read the next chunk
                return reader.read().then(readStream);
            });
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
