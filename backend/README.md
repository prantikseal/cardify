# Cardify Backend

This directory contains the Python Flask backend for the Cardify application.

## Setup and Running

### 1. Install Dependencies

Navigate to the `backend` directory and install the required Python packages using pip:

```bash
pip install -r requirements.txt
```

### 2. Configure Secret Key (Important for Production)

In `app.py`, the `app.config['SECRET_KEY']` is hardcoded for development. **You must change this to a strong, unique secret key before deploying to production.**

```python
app.config['SECRET_KEY'] = 'your-super-secret-key' # Change this!
```

### 3. Run the Development Server

Once dependencies are installed, you can run the Flask development server:

```bash
python app.py
```

Or using the Flask CLI (this might require setting `FLASK_APP=app.py` as an environment variable first if your file is named differently or not auto-detected):

```bash
flask run
```

The application will typically be available at `http://127.0.0.1:5001/`. The port is set to 5001 in `app.py`.

## API Endpoints

*   **`POST /register`**: Register a new user.
    *   Payload: `{ "username": "testuser", "email": "test@example.com", "password": "password123" }`
    *   Response: Success or error message.
*   **`POST /login`**: Log in an existing user.
    *   Payload: `{ "email": "test@example.com", "password": "password123" }`
    *   Response: JWT token or error message.
*   **`GET /protected`**: Access a protected resource.
    *   Header: `Authorization: Bearer <your_jwt_token>`
    *   Response: Success message if token is valid, else error.
*   **`GET /templates`**: Get a list of available business card templates.
    *   Response: JSON array of template objects. No authentication required.

## Card Management Endpoints

All card management endpoints require JWT authentication. Send the JWT token in the `Authorization` header as `Bearer <token>`.

*   **`POST /cards`**: Create a new business card.
    *   Payload: JSON object with card details:
        *   `template_id` (int, required): ID of the template to use.
        *   `card_slug` (str, required, unique): URL-friendly slug for the card.
        *   `full_name` (str, required): Full name of the card holder.
        *   `company_name` (str, optional): Company name.
        *   `job_title` (str, optional): Job title.
        *   `phone_number` (str, optional): Phone number.
        *   `email` (str, optional): Contact email.
        *   `website_url` (str, optional): Website URL.
        *   `address` (str, optional): Physical address.
        *   `social_media_links` (dict, optional): e.g., `{ "linkedin": "url", "twitter": "url" }`
        *   `business_description` (str, optional): Short description.
        *   `is_active` (boolean, optional, default: `true`): Whether the card is publicly visible.
    *   Response: JSON object of the created card (201) or error message.

*   **`GET /cards`**: List all cards for the authenticated user.
    *   Response: JSON array of card objects.

*   **`GET /cards/<int:card_id>`**: Retrieve a specific card by its ID.
    *   Response: JSON object of the card or error message (404 if not found, 403 if not owner).

*   **`PUT /cards/<int:card_id>`**: Update an existing card.
    *   Payload: JSON object with fields to update. Same fields as POST /cards.
    *   Response: JSON object of the updated card or error message.

*   **`DELETE /cards/<int:card_id>`**: Delete a card.
    *   Response: Success message (200 or 204) or error message.

*   **`GET /cards/public/<string:card_slug>`**: Retrieve a public card by its slug.
    *   No authentication required.
    *   Response: JSON object of the card if found and active, otherwise 404.

## Analytics Tracking Endpoints

These endpoints are used to track user interactions with public card pages. No authentication is required.

*   **`POST /cards/<string:card_slug>/view`**: Record a view/visit to a card.
    *   Payload: None.
    *   Response: Success message (200 or 204).
    *   Tracks: `card_id`, `visit_date`, `visitor_ip_hash`, `timestamp`.

*   **`POST /cards/<string:card_slug>/message`**: Record a message sent via the card's contact form.
    *   Payload: JSON object:
        *   `sender_name` (str, optional)
        *   `sender_email` (str, optional)
        *   `message_content` (str, required)
    *   Response: Success message (200).
    *   Tracks: `card_id`, submitted data, `received_at`.

*   **`POST /cards/<string:card_slug>/book-appointment`**: Record an appointment request.
    *   Payload: JSON object:
        *   `requester_name` (str, required)
        *   `requester_email` (str, required)
        *   `proposed_time` (str, required, e.g., ISO 8601 format or descriptive string)
    *   Response: Success message (200).
    *   Tracks: `card_id`, submitted data, `created_at`.

*   **`POST /cards/<string:card_slug>/click-link`**: Record a click on a link on the card.
    *   Payload: JSON object:
        *   `link_type` (str, required, e.g., 'social', 'website', 'qr_scan')
        *   `link_url` (str, required)
    *   Response: Success message (200).
    *   Tracks: `card_id`, submitted data, `clicked_at`.
