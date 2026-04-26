# Smart Campus Backend API

This project provides the backend services for the Smart Campus application, including authentication, ticket management, resource allocation, and notifications.

## Technologies
- Java 17
- Spring Boot 3
- MySQL (Production) / H2 (Testing)
- Spring Security with JWT
- Lombok
- JPA / Hibernate

## Authentication API

All authentication endpoints are under `/api/auth`.

### Register
- **Endpoint:** `POST /api/auth/register`
- **Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Response:** `200 OK` with JWT token and user details.

### Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```
- **Response:** `200 OK` with JWT token.

### Get Current User
- **Endpoint:** `GET /api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** User profile details.

---

## Notification API

All notification endpoints are under `/api/notifications`. Requires authentication.

### Fetch Notifications
- **Endpoint:** `GET /api/notifications?page=0&size=20`
- **Response:** Paged list of notifications.

### Get Unread Count
- **Endpoint:** `GET /api/notifications/unread-count`
- **Response:** `{ "count": 5 }`

### Mark as Read
- **Endpoint:** `PUT /api/notifications/{id}/read`
- **Response:** `{ "success": true }`

### Mark All as Read
- **Endpoint:** `PUT /api/notifications/read-all`
- **Response:** `{ "marked": 5 }`

### Notification Preferences
- **Endpoint:** `GET /api/notifications/preferences`
- **Response:** List of notification types and their enabled status.

### Update Preference
- **Endpoint:** `PUT /api/notifications/preferences`
- **Body:**
```json
{
  "type": "TICKET_UPDATE",
  "enabled": false
}
```

---

## Ticket API

Endpoints for managing support tickets.

### Create Ticket
- **Endpoint:** `POST /api/tickets`
- **Body:** Ticket details (title, description, etc.)
- **Security:** Authenticated users.

### Assign Ticket
- **Endpoint:** `PUT /api/tickets/{id}/assign`
- **Body:** String (username of assignee)
- **Security:** ADMIN or STAFF only.

### Update Status
- **Endpoint:** `PUT /api/tickets/{id}/status`
- **Body:** String (status name, e.g., "IN_PROGRESS", "CLOSED")
- **Security:** ADMIN or STAFF only.

---

## Resource API

Endpoints for managing campus resources.

### Get All Resources
- **Endpoint:** `GET /api/resources`
- **Query Params:** `type`, `status`, `location`, `minCapacity`
- **Security:** Authenticated users.

---

## Running the Application

1. Ensure MySQL is running.
2. Update `src/main/resources/application.properties` with your MySQL credentials.
3. Run `mvn spring-boot:run`.

## Testing
Run `mvn test` to execute unit and integration tests. Tests use an in-memory H2 database.
