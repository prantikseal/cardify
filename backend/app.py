import os
import datetime
import hashlib # Added for IP hashing
from collections import defaultdict # Added for visitor analytics
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-super-secret-key' # Change this in production!
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_EXPIRATION_DELTA'] = datetime.timedelta(hours=1)

# In-memory user store (for demonstration purposes)
users = {} # Stores user_id -> {username, email, password_hash}
user_id_counter = 1

# In-memory card store
user_cards = [] # List of card objects
next_card_id = 1

# In-memory analytics stores
analytics_visitors = []
analytics_messages = []
analytics_appointments = []
analytics_link_clicks = []

# Sample business card templates
sample_templates = [
    {
        "id": 1,
        "name": "Classic Professional",
        "structure_definition": """
<div style="border: 1px solid #ccc; padding: 20px; width: 400px; height: 220px; font-family: Arial, sans-serif; background-color: #f8f9fa; display: flex; flex-direction: column; justify-content: space-between;">
  <div style="display: flex; align-items: center; margin-bottom: 10px;">
    <img src="{{logo_url}}" alt="Logo" style="max-width: 60px; max-height: 60px; margin-right: 15px; border-radius: 5px; object-fit: contain;" />
    <div>
      <h2 style="margin: 0 0 5px 0; font-size: 1.4em; color: #333;">{{full_name}}</h2>
      <p style="margin: 0 0 3px 0; font-size: 1em; color: #555;">{{job_title}}</p>
      <p style="margin: 0; font-size: 0.9em; color: #555;">{{company_name}}</p>
    </div>
  </div>
  <div style="font-size: 0.85em; color: #444;">
    <p style="margin: 3px 0;"><strong>Email:</strong> <a href="mailto:{{email}}" style="color: #007bff; text-decoration: none;">{{email}}</a></p>
    <p style="margin: 3px 0;"><strong>Phone:</strong> {{phone_number}}</p>
    <p style="margin: 3px 0;"><strong>Website:</strong> <a href="{{website_url}}" target="_blank" style="color: #007bff; text-decoration: none;">{{website_url}}</a></p>
    <p style="margin: 3px 0;"><strong>Address:</strong> {{address}}</p>
  </div>
  <div style="margin-top: 10px; font-size: 0.8em;">
    <a href="{{linkedin_url}}" target="_blank" style="margin-right: 8px; color: #0077b5; text-decoration: none;">LinkedIn</a>
    <a href="{{twitter_url}}" target="_blank" style="margin-right: 8px; color: #1da1f2; text-decoration: none;">Twitter</a>
    <a href="{{github_url}}" target="_blank" style="color: #333; text-decoration: none;">GitHub</a>
  </div>
</div>
""",
        "preview_image_url": "http://example.com/preview_template_1.png" # Placeholder
    },
    {
        "id": 2,
        "name": "Modern Minimalist",
        "structure_definition": """
<div style="border: 1px solid #e0e0e0; padding: 25px; width: 400px; height: 220px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; display: flex; flex-direction: column; justify-content: center;">
  <div style="text-align: center; margin-bottom: 15px;">
    <img src="{{logo_url}}" alt="Logo" style="max-width: 50px; max-height: 50px; margin-bottom: 10px; border-radius: 50%; object-fit: contain;" />
    <h1 style="margin: 0 0 5px 0; font-size: 1.6em; color: #2c3e50; font-weight: 300;">{{full_name}}</h1>
    <p style="margin: 0 0 10px 0; font-size: 1em; color: #7f8c8d; font-weight: 300;">{{job_title}}</p>
    <p style="margin: 0; font-size: 0.9em; color: #95a5a6; font-weight: 300;">{{company_name}}</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #ecf0f1; margin: 15px 0;" />
  <div style="font-size: 0.8em; color: #7f8c8d; text-align: center;">
    <p style="margin: 4px 0;">{{email}} | {{phone_number}}</p>
    <p style="margin: 4px 0;"><a href="{{website_url}}" target="_blank" style="color: #3498db; text-decoration: none;">{{website_url}}</a></p>
    <div style="margin-top: 8px;">
      <a href="{{linkedin_url}}" target="_blank" style="margin: 0 5px; color: #3498db; text-decoration: none;">L</a>
      <a href="{{twitter_url}}" target="_blank" style="margin: 0 5px; color: #3498db; text-decoration: none;">T</a>
      <a href="{{github_url}}" target="_blank" style="margin: 0 5px; color: #3498db; text-decoration: none;">G</a>
    </div>
  </div>
</div>
""",
        "preview_image_url": "http://example.com/preview_template_2.png" # Placeholder
    },
    {
        "id": 3,
        "name": "Creative Portfolio",
        "structure_definition": """
<div style="border: none; padding: 20px; width: 400px; height: 220px; font-family: 'Georgia', serif; background: linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%); color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <h2 style="margin: 0 0 5px 0; font-size: 1.5em; font-weight: bold;">{{full_name}}</h2>
      <p style="margin: 0 0 10px 0; font-size: 0.95em; font-style: italic;">{{job_title}}</p>
      <p style="margin: 0; font-size: 0.9em;">{{company_name}}</p>
    </div>
    <img src="{{logo_url}}" alt="Logo" style="max-width: 55px; max-height: 55px; border-radius: 3px; object-fit: contain; border: 2px solid white;" />
  </div>
  <div style="margin-top: 15px; font-size: 0.85em;">
    <p style="margin: 5px 0;"><strong>E:</strong> <a href="mailto:{{email}}" style="color: #ffffff; text-decoration: none;">{{email}}</a></p>
    <p style="margin: 5px 0;"><strong>P:</strong> {{phone_number}}</p>
    <p style="margin: 5px 0;"><strong>W:</strong> <a href="{{website_url}}" target="_blank" style="color: #ffffff; text-decoration: none;">{{website_url}}</a></p>
  </div>
  <div style="margin-top:10px; text-align: right;">
    <a href="{{linkedin_url}}" target="_blank" style="margin-left: 10px; color: #f0f0f0; text-decoration: none; font-size:0.9em;">LinkedIn</a>
    <a href="{{twitter_url}}" target="_blank" style="margin-left: 10px; color: #f0f0f0; text-decoration: none; font-size:0.9em;">Twitter</a>
  </div>
  <p style="font-size: 0.75em; margin-top: 10px; max-height: 40px; overflow: hidden;">{{business_description}}</p>
</div>
""",
        "preview_image_url": "http://example.com/preview_template_3.png" # Placeholder
    }
]

@app.route('/register', methods=['POST'])
def register():
    global user_id_counter
    data = request.get_json()

    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing username, email, or password'}), 400

    username = data['username']
    email = data['email']
    password = data['password']

    if any(u['email'] == email for u in users.values()):
        return jsonify({'message': 'Email already registered'}), 409

    if any(u['username'] == username for u in users.values()):
        return jsonify({'message': 'Username already taken'}), 409

    password_hash = generate_password_hash(password)
    
    users[user_id_counter] = {
        'id': user_id_counter,
        'username': username,
        'email': email,
        'password_hash': password_hash,
        'created_at': datetime.datetime.utcnow()
    }
    user_id_counter += 1

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400

    email = data['email']
    password = data['password']

    user = None
    for u in users.values():
        if u['email'] == email:
            user = u
            break
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'message': 'Invalid email or password'}), 401

    payload = {
        'identity': user['id'], # Using 'identity' key for user_id as often standard
        'username': user['username'],
        'exp': datetime.datetime.utcnow() + app.config['JWT_EXPIRATION_DELTA']
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm=app.config['JWT_ALGORITHM'])

    return jsonify({'token': token}), 200

@app.route('/protected', methods=['GET'])
def protected():
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401

    token = auth_header.split(' ')[1]

    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[app.config['JWT_ALGORITHM']])
        # You can fetch user from DB here if needed using payload['identity']
        return jsonify({'message': f"Hello {payload['username']}! User ID: {payload['identity']}. This is a protected resource."}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401

# Helper function to get user_id from token
def get_current_user_id_from_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None # Or raise an exception

    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[app.config['JWT_ALGORITHM']])
        return payload.get('identity')
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None # Or raise an exception

@app.route('/templates', methods=['GET'])
def get_templates():
    return jsonify(sample_templates), 200

@app.route('/cards', methods=['POST'])
def create_card():
    global next_card_id
    current_user_id = get_current_user_id_from_token()
    if not current_user_id:
        return jsonify({'message': 'Authentication required'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body must be JSON'}), 400

    required_fields = ['template_id', 'card_slug', 'full_name']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400

    template_id = data['template_id']
    card_slug = data['card_slug']
    full_name = data['full_name']

    # Validate template_id
    if not any(t['id'] == template_id for t in sample_templates):
        return jsonify({'message': 'Invalid template_id'}), 400

    # Validate uniqueness of card_slug
    if any(c['card_slug'] == card_slug for c in user_cards):
        return jsonify({'message': 'Card slug already exists'}), 409

    new_card = {
        'id': next_card_id,
        'user_id': current_user_id,
        'template_id': template_id,
        'card_slug': card_slug,
        'full_name': full_name,
        'company_name': data.get('company_name'),
        'job_title': data.get('job_title'),
        'phone_number': data.get('phone_number'),
        'email': data.get('email'),
        'website_url': data.get('website_url'),
        'address': data.get('address'),
        'social_media_links': data.get('social_media_links', {}),
        'business_description': data.get('business_description'),
        'custom_css': data.get('custom_css'), # Assuming this might be added later
        'is_active': data.get('is_active', True),
        'created_at': datetime.datetime.utcnow(),
        'updated_at': datetime.datetime.utcnow()
    }
    user_cards.append(new_card)
    next_card_id += 1

    return jsonify(new_card), 201

@app.route('/cards', methods=['GET'])
def get_user_cards():
    current_user_id = get_current_user_id_from_token()
    if not current_user_id:
        return jsonify({'message': 'Authentication required'}), 401

    cards_for_user = [card for card in user_cards if card['user_id'] == current_user_id]
    return jsonify(cards_for_user), 200

@app.route('/cards/<int:card_id>', methods=['GET'])
def get_specific_card(card_id):
    current_user_id = get_current_user_id_from_token()
    if not current_user_id:
        return jsonify({'message': 'Authentication required'}), 401

    card = next((card for card in user_cards if card['id'] == card_id), None)

    if not card:
        return jsonify({'message': 'Card not found'}), 404

    if card['user_id'] != current_user_id:
        return jsonify({'message': 'Access forbidden: You do not own this card'}), 403

    return jsonify(card), 200

@app.route('/cards/<int:card_id>', methods=['PUT'])
def update_card(card_id):
    current_user_id = get_current_user_id_from_token()
    if not current_user_id:
        return jsonify({'message': 'Authentication required'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body must be JSON'}), 400

    card = next((card for card in user_cards if card['id'] == card_id), None)

    if not card:
        return jsonify({'message': 'Card not found'}), 404

    if card['user_id'] != current_user_id:
        return jsonify({'message': 'Access forbidden: You do not own this card'}), 403

    # Validate uniqueness of card_slug if it's being changed
    if 'card_slug' in data and data['card_slug'] != card['card_slug']:
        if any(c['card_slug'] == data['card_slug'] for c in user_cards):
            return jsonify({'message': 'Card slug already exists'}), 409
        card['card_slug'] = data['card_slug']

    # Update fields
    card['template_id'] = data.get('template_id', card['template_id'])
    # Validate template_id if it's being changed
    if 'template_id' in data and not any(t['id'] == card['template_id'] for t in sample_templates):
        return jsonify({'message': 'Invalid template_id'}), 400

    card['full_name'] = data.get('full_name', card['full_name'])
    card['company_name'] = data.get('company_name', card['company_name'])
    card['job_title'] = data.get('job_title', card['job_title'])
    card['phone_number'] = data.get('phone_number', card['phone_number'])
    card['email'] = data.get('email', card['email'])
    card['website_url'] = data.get('website_url', card['website_url'])
    card['address'] = data.get('address', card['address'])
    card['social_media_links'] = data.get('social_media_links', card['social_media_links'])
    card['business_description'] = data.get('business_description', card['business_description'])
    card['custom_css'] = data.get('custom_css', card['custom_css'])
    card['is_active'] = data.get('is_active', card['is_active'])
    card['updated_at'] = datetime.datetime.utcnow()

    return jsonify(card), 200

@app.route('/cards/<int:card_id>', methods=['DELETE'])
def delete_card(card_id):
    global user_cards
    current_user_id = get_current_user_id_from_token()
    if not current_user_id:
        return jsonify({'message': 'Authentication required'}), 401

    card_index = -1
    for i, card_item in enumerate(user_cards):
        if card_item['id'] == card_id:
            card_index = i
            break

    if card_index == -1:
        return jsonify({'message': 'Card not found'}), 404

    if user_cards[card_index]['user_id'] != current_user_id:
        return jsonify({'message': 'Access forbidden: You do not own this card'}), 403

    user_cards.pop(card_index)
    return jsonify({'message': 'Card deleted successfully'}), 200 # Or 204 No Content

@app.route('/cards/public/<string:card_slug>', methods=['GET'])
def get_public_card_by_slug(card_slug):
    card = next((card for card in user_cards if card['card_slug'] == card_slug and card['is_active']), None)

    if not card:
        return jsonify({'message': 'Card not found or not active'}), 404

    # For public view, we might want to filter out some sensitive data,
    # but for now, returning all card data.
    # Example:
    # public_card_data = {k: v for k, v in card.items() if k not in ['user_id', 'custom_css']}
    return jsonify(card), 200

# Helper function to get card by slug
def get_card_by_slug(card_slug):
    return next((card for card in user_cards if card['card_slug'] == card_slug and card['is_active']), None)

# Helper function to get a card and verify ownership
def get_card_and_verify_ownership(card_id, user_id):
    card = next((card for card in user_cards if card['id'] == card_id), None)
    if not card:
        return None, ('Card not found', 404)
    if card['user_id'] != user_id:
        return None, ('Access forbidden: You do not own this card', 403)
    return card, None

@app.route('/cards/<string:card_slug>/view', methods=['POST'])
def record_card_view(card_slug):
    card = get_card_by_slug(card_slug)
    if not card:
        return jsonify({'message': 'Card not found or not active'}), 404

    card_id = card['id']
    visit_date = datetime.date.today().isoformat() # YYYY-MM-DD
    
    # Get and hash IP address
    visitor_ip = request.remote_addr
    ip_hash = hashlib.sha256(visitor_ip.encode('utf-8')).hexdigest()

    analytics_visitors.append({
        'card_id': card_id,
        'visit_date': visit_date,
        'visitor_ip_hash': ip_hash,
        'timestamp': datetime.datetime.utcnow()
    })
    # print(f"Recorded view for card {card_id} from IP hash {ip_hash}") # For debugging
    return jsonify({'message': 'View recorded'}), 200 # Or 204 No Content

@app.route('/cards/<string:card_slug>/message', methods=['POST'])
def record_message(card_slug):
    card = get_card_by_slug(card_slug)
    if not card:
        return jsonify({'message': 'Card not found or not active'}), 404

    data = request.get_json()
    if not data or not data.get('message_content'):
        return jsonify({'message': 'Missing message_content in request body'}), 400

    analytics_messages.append({
        'card_id': card['id'],
        'sender_name': data.get('sender_name'),
        'sender_email': data.get('sender_email'),
        'message_content': data['message_content'],
        'received_at': datetime.datetime.utcnow()
    })
    # print(f"Recorded message for card {card['id']}") # For debugging
    return jsonify({'message': 'Message recorded'}), 200

@app.route('/cards/<string:card_slug>/book-appointment', methods=['POST'])
def record_appointment(card_slug):
    card = get_card_by_slug(card_slug)
    if not card:
        return jsonify({'message': 'Card not found or not active'}), 404

    data = request.get_json()
    if not data or not data.get('requester_name') or not data.get('requester_email') or not data.get('proposed_time'):
        return jsonify({'message': 'Missing requester_name, requester_email, or proposed_time in request body'}), 400

    analytics_appointments.append({
        'card_id': card['id'],
        'requester_name': data['requester_name'],
        'requester_email': data['requester_email'],
        'proposed_time': data['proposed_time'],
        # 'data': data, # Alternative: store the whole JSON
        'created_at': datetime.datetime.utcnow()
    })
    # print(f"Recorded appointment for card {card['id']}") # For debugging
    return jsonify({'message': 'Appointment request recorded'}), 200

@app.route('/cards/<string:card_slug>/click-link', methods=['POST'])
def record_link_click(card_slug):
    card = get_card_by_slug(card_slug)
    if not card:
        return jsonify({'message': 'Card not found or not active'}), 404

    data = request.get_json()
    if not data or not data.get('link_type') or not data.get('link_url'):
        return jsonify({'message': 'Missing link_type or link_url in request body'}), 400

    analytics_link_clicks.append({
        'card_id': card['id'],
        'link_type': data['link_type'],
        'link_url': data['link_url'],
        # 'data': data, # Alternative if more fields come later
        'clicked_at': datetime.datetime.utcnow()
    })
    # print(f"Recorded link click for card {card['id']}") # For debugging
    return jsonify({'message': 'Link click recorded'}), 200

@app.route('/cards/<int:card_id>/analytics/visitors', methods=['GET'])
def get_visitor_analytics(card_id):
    user_id = get_current_user_id_from_token()
    if not user_id:
        return jsonify({'message': 'Authentication required'}), 401

    card, error_response = get_card_and_verify_ownership(card_id, user_id)
    if error_response:
        return jsonify({'message': error_response[0]}), error_response[1]

    card_visits = [v for v in analytics_visitors if v['card_id'] == card_id]

    # Process data: group by visit_date and count unique visitor_ip_hash
    daily_unique_visitors = defaultdict(set)
    for visit in card_visits:
        daily_unique_visitors[visit['visit_date']].add(visit['visitor_ip_hash'])

    processed_data = []
    for visit_date, unique_ips in daily_unique_visitors.items():
        processed_data.append({
            "date": visit_date,
            "unique_visitors": len(unique_ips)
        })
    
    # Sort by date (optional, but good for consistency)
    processed_data.sort(key=lambda x: x['date'])

    return jsonify(processed_data), 200

@app.route('/cards/<int:card_id>/analytics/messages', methods=['GET'])
def get_message_analytics(card_id):
    user_id = get_current_user_id_from_token()
    if not user_id:
        return jsonify({'message': 'Authentication required'}), 401

    card, error_response = get_card_and_verify_ownership(card_id, user_id)
    if error_response:
        return jsonify({'message': error_response[0]}), error_response[1]

    card_messages = [m for m in analytics_messages if m['card_id'] == card_id]
    
    # Sort by received_at descending (newest first)
    card_messages.sort(key=lambda x: x['received_at'], reverse=True)

    return jsonify(card_messages), 200

@app.route('/cards/<int:card_id>/analytics/appointments', methods=['GET'])
def get_appointment_analytics(card_id):
    user_id = get_current_user_id_from_token()
    if not user_id:
        return jsonify({'message': 'Authentication required'}), 401

    card, error_response = get_card_and_verify_ownership(card_id, user_id)
    if error_response:
        return jsonify({'message': error_response[0]}), error_response[1]

    card_appointments = [a for a in analytics_appointments if a['card_id'] == card_id]
    
    # Sort by created_at descending (newest first)
    card_appointments.sort(key=lambda x: x['created_at'], reverse=True)

    return jsonify(card_appointments), 200

@app.route('/cards/<int:card_id>/analytics/link_clicks', methods=['GET'])
def get_link_click_analytics(card_id):
    user_id = get_current_user_id_from_token()
    if not user_id:
        return jsonify({'message': 'Authentication required'}), 401

    card, error_response = get_card_and_verify_ownership(card_id, user_id)
    if error_response:
        return jsonify({'message': error_response[0]}), error_response[1]

    card_link_clicks = [lc for lc in analytics_link_clicks if lc['card_id'] == card_id]
    
    # Sort by clicked_at descending (newest first)
    card_link_clicks.sort(key=lambda x: x['clicked_at'], reverse=True)

    return jsonify(card_link_clicks), 200

if __name__ == '__main__':
    # For development, Flask's built-in server is fine.
    # For production, use a proper WSGI server like Gunicorn.
    app.run(debug=True, port=5001) # Changed port to 5001 to avoid potential conflicts
