const userIpt = document.getElementById('input');
const sendBtn = document.getElementById('send');
const resultDiv = document.getElementById('result');
const loadingBdr = document.getElementById('loading');

userIpt.focus();

loadingBdr.style.display = "none";

let requestBody = {
    model: 'gpt-3.5-turbo',
    messages: [],
    temperature: 0.8,
}

function sendMessage() {
    if (userIpt.value === '') return;

    loadingBdr.style.display = "block";
    sendBtn.style.display = "none";
    userIpt.style.display = "none";

    let userMessage = userIpt.value;

    const inputElement = document.createElement('pre');
    inputElement.id = "input-message"
    inputElement.textContent = userMessage
    resultDiv.appendChild(inputElement);

    if (requestBody.messages.length > 6) {
        requestBody.messages.splice(0, 2);
    }

    requestBody.messages.push({role: 'user', content: userMessage})

    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(JSON.stringify(requestBody));
            controller.close();
        }
    });

    fetch(`https://api.jiasir.io:3000/chat`, {
        method: 'POST', headers: {
            'Content-Type': 'application/json',
        }, body: stream
    })
        .then(response => response.body)
        .then(body => {
            const reader = body.getReader();
            let result = '';

            function read() {
                reader.read().then(({done, value}) => {
                    if (done) {
                        const resultElement = document.createElement('pre');
                        resultElement.textContent = result;
                        resultDiv.appendChild(resultElement);
                        resultDiv.appendChild(document.createElement('br'));
                        requestBody.messages.push(JSON.parse(result).choices[0].message);
                        loadingBdr.style.display = "none";
                        sendBtn.style.display = "block";
                        userIpt.style.display = "block";
                        userIpt.focus();
                        userIpt.value = '';
                        return;
                    }
                    result += new TextDecoder().decode(value);
                    read();
                });
            }

            read();
        })
        .catch(error => console.error(error));
}

sendBtn.addEventListener('click', sendMessage);

const textarea = document.getElementById('input');
textarea.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    } else if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        const startPos = this.selectionStart;
        const endPos = this.selectionEnd;
        const value = this.value;
        this.value = value.substring(0, startPos) + '\n' + value.substring(endPos, value.length);
        this.selectionStart = this.selectionEnd = startPos + 1;
    }
});
