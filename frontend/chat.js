const input = document.getElementById('input');
const sendBtn = document.getElementById('send');

function sendMessage() {
    const message = input.value;

    // Send HTTP GET request to API endpoint, and print result in response
    fetch(`/api/sendMessage?message=${message}`)
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.error(error));

    input.value = '';
}

sendBtn.addEventListener('click', sendMessage);