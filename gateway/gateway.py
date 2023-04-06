import os
import ssl
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Allow CORS requests
CORS(app)

# Read the certificate and key files
with open('/root/cert/sunsun.dev.cer') as f:
    cert_file = f.read()
with open('/root/cert/sunsun.dev.key') as f:
    key_file = f.read()

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile=cert_file, keyfile=key_file)


# Route to handle chat requests
# from the frontend app and forward them
# to OpenAI API server using requests library and return the response
# to the frontend app using flask response object (jsonify)
@app.route('/v1/chat/completions', methods=['POST'])
def chat():
    """
    Handle chat requests from the frontend app and forward them to OpenAI API server
    and return the response to the frontend app using flask response object (jsonify)

    :return: Response from OpenAI API server
    """
    try:
        # Get the request body from the client
        request_body = request.json

        # Send the request to OpenAI API
        response = requests.post('https://api.openai.com/v1/chat/completions', headers={
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
        }, json=request_body)

        # Return the response from OpenAI API to the client
        return jsonify(response.json())

    except Exception as e:
        # If there is an error, return an error message to the client
        return jsonify({'error': str(e)})
        

# Start the HTTPS server on the specified port
if __name__ == '__main__':
    app.run(ssl_context=context, port=int(os.environ.get('PORT', 3000)))
