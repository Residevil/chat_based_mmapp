from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from mind_map_generator import generate_mind_map, update_mind_map, logger

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}) # This enables CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Backend is working"}), 200

@app.route('/api/generate_map', methods=['POST'])
def generate_map():
    try:
        data = request.json
        print(f"Received data: {data}")  # Log received data
        user_input = data['input']
        print(f"User input: {user_input}")  # Log user input
        print(f"User input type: {type(user_input)}")  # Log user input type

        mind_map = generate_mind_map(user_input)
        
        # Clear existing data and set the new mind map
        socketio.emit('clear_map')
        socketio.emit('map_updated', mind_map)
        return jsonify(mind_map), 200
    except Exception as e:
        logger.error(f"Error generating mind map: {str(e)}")
        return jsonify({"error": str(e)}), 500

@socketio.on('update_map')
def handle_update_map(data):
    try:
        updated_map = update_mind_map(data['map'], data['changes'])
        socketio.emit('map_updated', updated_map)
    except Exception as e:
        socketio.emit('error', {'message': str(e)})

@socketio.on_error()
def error_handler(e):
    print(f"SocketIO error: {str(e)}")

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)