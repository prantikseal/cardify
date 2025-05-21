# Cardify Backend

This directory contains the Python Flask backend for the Cardify application.

## Setup Instructions

1.  **Navigate to the Backend Directory:**
    Open your terminal and change to the `backend` directory of the project:
    ```bash
    cd path/to/your/project/backend
    ```

2.  **Create a Python Virtual Environment:**
    It's highly recommended to use a virtual environment to manage dependencies.
    *   Create the environment (use `python3` if `python` defaults to Python 2):
        ```bash
        python3 -m venv venv
        # OR
        python -m venv venv
        ```
    *   Activate the virtual environment:
        *   **macOS/Linux:**
            ```bash
            source venv/bin/activate
            ```
        *   **Windows (Command Prompt/PowerShell):**
            ```bash
            venv\Scripts\activate
            ```
    You should see `(venv)` at the beginning of your terminal prompt.

3.  **Install Dependencies:**
    Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Development Server

1.  **Configure Secret Key (Important for Production):**
    In `app.py`, the `app.config['SECRET_KEY']` is hardcoded for development. **You must change this to a strong, unique secret key before deploying to production.**
    ```python
    app.config['SECRET_KEY'] = 'your-super-secret-key' # Change this!
    ```

2.  **Set Environment Variables (Optional but Recommended):**
    For a smoother development experience, you can set the following environment variables. Flask might auto-detect `app.py` and development mode, but explicitly setting them is good practice.
    *   **macOS/Linux:**
        ```bash
        export FLASK_APP=app.py
        export FLASK_ENV=development
        ```
    *   **Windows (Command Prompt):**
        ```bash
        set FLASK_APP=app.py
        set FLASK_ENV=development
        ```
    *   **Windows (PowerShell):**
        ```bash
        $env:FLASK_APP="app.py"
        $env:FLASK_ENV="development"
        ```

3.  **Run the Server:**
    Start the Flask development server. We use port 5001 to match the frontend proxy configuration.
    ```bash
    flask run --port=5001
    ```
    You should see output similar to:
    ```
     * Serving Flask app 'app.py' (lazy loading)
     * Environment: development
     * Debug mode: on
     * Running on http://127.0.0.1:5001/ (Press CTRL+C to quit)
     * Restarting with stat
     * Debugger is active!
     * Debugger PIN: xxx-xxx-xxx
    ```

## API Endpoints Overview

The backend provides several categories of API endpoints. All data is currently stored in-memory and will be reset when the server restarts.

*   **Authentication Endpoints:** User registration and login.
*   **Template Endpoints:** Listing available card templates.
*   **Card Management Endpoints:** CRUD operations for user business cards.
*   **Analytics Tracking Endpoints:** Recording interactions with public card pages.

See below for a detailed list of all available endpoints, their required payloads, and expected responses.

---

### Detailed API Endpoints

#### Authentication

*   **`POST /register`**: Register a new user.
    *   Payload: `{ "username": "testuser", "email": "test@example.com", "password": "password123" }`
    *   Response: Success or error message.
*   **`POST /login`**: Log in an existing user.
    *   Payload: `{ "email": "test@example.com", "password": "password123" }`
    *   Response: JWT token or error message.
*   **`GET /protected`**: Access a protected resource (example).
    *   Header: `Authorization: Bearer <your_jwt_token>`
    *   Response: Success message if token is valid, else error.

#### Templates

*   **`GET /templates`**: Get a list of available business card templates.
    *   Response: JSON array of template objects. No authentication required.

#### Card Management

All card management endpoints (except public view) require JWT authentication. Send the JWT token in the `Authorization` header as `Bearer <token>`.

*   **`POST /cards`**: Create a new business card.
    *   Payload: JSON object with card details (see `database/schema.md` for full list, common fields: `template_id`, `card_slug`, `full_name`).
    *   Response: JSON object of the created card (201) or error message.
*   **`GET /cards`**: List all cards for the authenticated user.
    *   Response: JSON array of card objects.
*   **`GET /cards/<int:card_id>`**: Retrieve a specific card by its ID.
    *   Response: JSON object of the card or error message (404 if not found, 403 if not owner).
*   **`PUT /cards/<int:card_id>`**: Update an existing card.
    *   Payload: JSON object with fields to update.
    *   Response: JSON object of the updated card or error message.
*   **`DELETE /cards/<int:card_id>`**: Delete a card.
    *   Response: Success message (200 or 204) or error message.
*   **`GET /cards/public/<string:card_slug>`**: Retrieve a public card by its slug.
    *   No authentication required.
    *   Response: JSON object of the card if found and active, otherwise 404.

#### Analytics Tracking

These endpoints are used to track user interactions with public card pages. No authentication is required.

*   **`POST /cards/<string:card_slug>/view`**: Record a view/visit to a card.
    *   Payload: None.
    *   Tracks: `card_id`, `visit_date`, `visitor_ip_hash`, `timestamp`.
*   **`POST /cards/<string:card_slug>/message`**: Record a message sent via the card's contact form.
    *   Payload: JSON object (`sender_name`, `sender_email`, `message_content`).
    *   Tracks: `card_id`, submitted data, `received_at`.
*   **`POST /cards/<string:card_slug>/book-appointment`**: Record an appointment request.
    *   Payload: JSON object (`requester_name`, `requester_email`, `proposed_time`).
    *   Tracks: `card_id`, submitted data, `created_at`.
*   **`POST /cards/<string:card_slug>/click-link`**: Record a click on a link on the card.
    *   Payload: JSON object (`link_type`, `link_url`).
    *   Tracks: `card_id`, submitted data, `clicked_at`.

### Analytics Query Endpoints

These endpoints require JWT authentication (send token in `Authorization: Bearer <token>` header) and retrieve processed analytics data for a user's specific card.

*   **`GET /cards/<int:card_id>/analytics/visitors`**:
    *   Retrieves daily unique visitor counts for the specified card.
    *   Response: `[{ "date": "YYYY-MM-DD", "unique_visitors": count }, ...]`

*   **`GET /cards/<int:card_id>/analytics/messages`**:
    *   Retrieves a list of messages sent through the card's contact form, sorted by most recent.
    *   Response: `[{ "sender_name": "...", "sender_email": "...", "message_content": "...", "received_at": "timestamp" }, ...]`

*   **`GET /cards/<int:card_id>/analytics/appointments`**:
    *   Retrieves a list of appointment requests made via the card, sorted by most recent.
    *   Response: `[{ "requester_name": "...", "requester_email": "...", "proposed_time": "...", "created_at": "timestamp" }, ...]`

*   **`GET /cards/<int:card_id>/analytics/link_clicks`**:
    *   Retrieves a list of link click events for the card, sorted by most recent.
    *   Response: `[{ "link_type": "...", "link_url": "...", "clicked_at": "timestamp" }, ...]`
