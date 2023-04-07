import os
import ssl
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Allow CORS requests, which are required for the frontend app to be able to
CORS(app)

# Read OPENAI_API_KEY from file
OPENAI_API_KEY = open('./keys/openai_api_key.txt').read()

# Certificate and key files for ssl context
CERT_FILE = './cert/sunsun.dev.cer'
KEY_FILE = './cert/sunsun.dev.key'

# Server port
PORT = 3000

# Create ssl context for HTTPS server using the certificate and key files above
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)


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
        # Get the request body from the client request object (flask)
        request_body = request.json

        # Send the request to OpenAI API server using requests library and get the response object
        response = requests.post('https://api.openai.com/v1/chat/completions', headers={
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + OPENAI_API_KEY
        }, json=request_body)

        # Return the response from OpenAI API to the client using flask response object (jsonify)
        return jsonify(response.json())

    except Exception as e:
        # If there is an error, return an error message to the client
        return jsonify({'error': str(e)})
        

# Start the HTTPS server on the specified port
if __name__ == '__main__':
    app.run(ssl_context=context, port=int(os.environ.get('PORT', PORT)))
