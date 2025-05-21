# Cardify Database Schema

This document outlines the database schema for the Cardify application.

## Tables

### `users`

Stores user account information.

| Column          | Type        | Constraints                               | Description                     |
|-----------------|-------------|-------------------------------------------|---------------------------------|
| `id`            | Integer     | Primary Key, Auto-increment               | Unique identifier for the user  |
| `username`      | String      | Unique, Not Null                          | User's chosen username          |
| `email`         | String      | Unique, Not Null                          | User's email address            |
| `password_hash` | String      | Not Null                                  | Hashed password for the user    |
| `created_at`    | Timestamp   | Default NOW                               | Timestamp of account creation   |
| `updated_at`    | Timestamp   | Default NOW                               | Timestamp of last account update|

### `templates`

Stores available business card templates.

| Column                 | Type         | Constraints                               | Description                                     |
|------------------------|--------------|-------------------------------------------|-------------------------------------------------|
| `id`                   | Integer      | Primary Key, Auto-increment               | Unique identifier for the template              |
| `name`                 | String       | Not Null                                  | Name of the template (e.g., "Modern Minimal")   |
| `structure_definition` | JSON or Text |                                           | Defines HTML/CSS or rendering logic for the card|
| `preview_image_url`    | String       | Optional                                  | URL to an image previewing the template         |
| `created_at`           | Timestamp    | Default NOW                               | Timestamp of template creation                  |

### `cards`

Stores the actual business card data created by users.

| Column                | Type      | Constraints                               | Description                                       |
|-----------------------|-----------|-------------------------------------------|---------------------------------------------------|
| `id`                  | Integer   | Primary Key, Auto-increment               | Unique identifier for the card                    |
| `user_id`             | Integer   | Foreign Key to `users.id`, Not Null       | Owner of the card                                 |
| `template_id`         | Integer   | Foreign Key to `templates.id`, Not Null   | Template used for this card                       |
| `card_slug`           | String    | Unique, Not Null                          | Unique URL slug for the public card page          |
| `logo_url`            | String    | Optional                                  | URL of the company/personal logo                  |
| `company_name`        | String    | Optional                                  | Name of the company                               |
| `full_name`           | String    | Not Null                                  | Full name of the card holder                      |
| `job_title`           | String    | Optional                                  | Job title of the card holder                      |
| `phone_number`        | String    | Optional                                  | Contact phone number                              |
| `email`               | String    | Optional                                  | Contact email address                             |
| `website_url`         | String    | Optional                                  | URL to a personal or company website              |
| `address`             | String    | Optional                                  | Physical address                                  |
| `social_media_links`  | JSON      |                                           | JSON object for social media links                |
| `business_description`| Text      | Optional                                  | A short description of the business or individual |
| `custom_css`          | Text      | Optional                                  | User-defined CSS for card customization           |
| `is_active`           | Boolean   | Default True                              | Whether the card is publicly accessible           |
| `created_at`          | Timestamp | Default NOW                               | Timestamp of card creation                        |
| `updated_at`          | Timestamp | Default NOW                               | Timestamp of last card update                     |

### `analytics_visitors`

Tracks visits to public card pages.

| Column            | Type    | Constraints                               | Description                                   |
|-------------------|---------|-------------------------------------------|-----------------------------------------------|
| `id`              | Integer | Primary Key, Auto-increment               | Unique identifier for the visit record        |
| `card_id`         | Integer | Foreign Key to `cards.id`, Not Null       | The card that was visited                     |
| `visit_date`      | Date    | Not Null                                  | Date of the visit                             |
| `visitor_ip_hash` | String  | Not Null                                  | Hashed IP address of the visitor              |
| `user_agent`      | String  | Optional                                  | User agent string of the visitor's browser    |
| `count`           | Integer | Default 1                                 | Number of visits from this IP on this date    |
*Consider a composite primary key like (`card_id`, `visit_date`, `visitor_ip_hash`) if storing individual unique visits per day without a separate `id` and `count`. For simplicity with `count`, a simple `id` is fine.*

### `analytics_messages`

Stores messages sent through the contact form on a card.

| Column            | Type      | Constraints                               | Description                             |
|-------------------|-----------|-------------------------------------------|-----------------------------------------|
| `id`              | Integer   | Primary Key, Auto-increment               | Unique identifier for the message       |
| `card_id`         | Integer   | Foreign Key to `cards.id`, Not Null       | The card associated with the message    |
| `sender_name`     | String    | Optional                                  | Name of the person sending the message  |
| `sender_email`    | String    | Optional                                  | Email of the person sending the message |
| `message_content` | Text      | Not Null                                  | Content of the message                  |
| `received_at`     | Timestamp | Default NOW                               | Timestamp when the message was received |

### `analytics_appointments`

Stores appointment requests made via a card.

| Column            | Type      | Constraints                               | Description                                     |
|-------------------|-----------|-------------------------------------------|-------------------------------------------------|
| `id`              | Integer   | Primary Key, Auto-increment               | Unique identifier for the appointment request   |
| `card_id`         | Integer   | Foreign Key to `cards.id`, Not Null       | The card associated with the appointment        |
| `requester_name`  | String    | Not Null                                  | Name of the person requesting the appointment   |
| `requester_email` | String    | Not Null                                  | Email of the person requesting the appointment  |
| `proposed_time`   | Timestamp | Not Null                                  | User's proposed time for the appointment        |
| `status`          | String    | Default 'pending'                         | Status (e.g., 'pending', 'confirmed', 'cancelled')|
| `created_at`      | Timestamp | Default NOW                               | Timestamp of appointment request creation       |

### `analytics_link_clicks`

Tracks clicks on various links present on a card.

| Column            | Type      | Constraints                               | Description                                     |
|-------------------|-----------|-------------------------------------------|-------------------------------------------------|
| `id`              | Integer   | Primary Key, Auto-increment               | Unique identifier for the link click event      |
| `card_id`         | Integer   | Foreign Key to `cards.id`, Not Null       | The card on which the link was clicked          |
| `link_type`       | String    |                                           | Type of link (e.g., 'social', 'website', 'qr_scan', 'custom_button') |
| `link_url`        | String    | Not Null                                  | The actual URL that was clicked                 |
| `clicked_at`      | Timestamp | Default NOW                               | Timestamp of when the link was clicked          |
| `visitor_ip_hash` | String    | Optional                                  | Hashed IP of the visitor who clicked the link   |
