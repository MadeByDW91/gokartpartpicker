# API Documentation

Base URL: `http://localhost:3001` (development)

All endpoints return JSON. Error responses follow the format: `{ error: "Error message" }`

## Authentication

Some endpoints require admin authentication via the `x-admin-token` header:
```
x-admin-token: <ADMIN_TOKEN>
```

The `ADMIN_TOKEN` value should match the `ADMIN_TOKEN` environment variable set on the backend server.

---

## Parts Endpoints

### GET /parts

List parts with filtering and pagination.

**Method**: `GET`

**Query Parameters**:
- `q` (string, optional): Free-text search across name, brand, and SKU (case-insensitive)
- `category` (string, optional): Exact match on category field
- `brand` (string, optional): Case-insensitive contains match on brand
- `engine_model` (string, optional): Filter via CompatibilityProfile where engineModel contains value (case-insensitive)
- `chain_size` (string, optional): Exact match on compatibility.chainSize
- `price_min` (number, optional): Minimum price filter
- `price_max` (number, optional): Maximum price filter
- `page` (number, optional): Page number (default: 1)
- `page_size` (number, optional): Items per page (default: 20)

**Admin Token Required**: No

**Example Request**:
```
GET /parts?category=engine&price_min=100&page=1&page_size=20
```

**Example Response**:
```json
{
  "items": [
    {
      "id": "clx123...",
      "name": "Predator 212 Engine",
      "sku": "PRED212",
      "brand": "Harbor Freight",
      "category": "engine",
      "description": "212cc 4-stroke engine",
      "price": 149.99,
      "imageUrls": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "compatibilityProfiles": [
        {
          "id": "clx456...",
          "partId": "clx123...",
          "engineModel": "212cc",
          "shaftDiameter": "3/4\"",
          "boltPattern": null,
          "chainSize": null,
          "frameType": null,
          "notes": null
        }
      ]
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 20
}
```

---

### GET /parts/:id

Get a single part by ID with all compatibility profiles.

**Method**: `GET`

**URL Parameters**:
- `id` (string): Part ID

**Admin Token Required**: No

**Example Request**:
```
GET /parts/clx123...
```

**Example Response**:
```json
{
  "id": "clx123...",
  "name": "Predator 212 Engine",
  "sku": "PRED212",
  "brand": "Harbor Freight",
  "category": "engine",
  "description": "212cc 4-stroke engine",
  "price": 149.99,
  "imageUrls": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "compatibilityProfiles": [
    {
      "id": "clx456...",
      "partId": "clx123...",
      "engineModel": "212cc",
      "shaftDiameter": "3/4\"",
      "boltPattern": null,
      "chainSize": null,
      "frameType": null,
      "notes": null
    }
  ]
}
```

---

### POST /parts

Create a new part with optional compatibility profiles.

**Method**: `POST`

**Admin Token Required**: Yes (header: `x-admin-token`)

**Request Body**:
```json
{
  "name": "Predator 212 Engine",
  "sku": "PRED212",
  "brand": "Harbor Freight",
  "category": "engine",
  "price": 149.99,
  "imageUrls": ["https://example.com/image.jpg"],
  "compatibilityProfiles": [
    {
      "engineModel": "212cc",
      "shaftDiameter": "3/4\"",
      "boltPattern": null,
      "chainSize": null,
      "frameType": null,
      "notes": "Keyed shaft"
    }
  ]
}
```

**Example Request**:
```
POST /parts
Headers:
  Content-Type: application/json
  x-admin-token: your-admin-token-here

Body: { ... }
```

**Example Response** (201 Created):
```json
{
  "id": "clx123...",
  "name": "Predator 212 Engine",
  "sku": "PRED212",
  "brand": "Harbor Freight",
  "category": "engine",
  "description": null,
  "price": 149.99,
  "imageUrls": ["https://example.com/image.jpg"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "compatibilityProfiles": [
    {
      "id": "clx456...",
      "partId": "clx123...",
      "engineModel": "212cc",
      "shaftDiameter": "3/4\"",
      "boltPattern": null,
      "chainSize": null,
      "frameType": null,
      "notes": "Keyed shaft"
    }
  ]
}
```

**Error Response** (401 Unauthorized):
```json
{
  "error": "Unauthorized"
}
```

---

## Build Endpoints

### POST /builds

Create a new build.

**Method**: `POST`

**Admin Token Required**: No

**Request Body**:
```json
{
  "userName": "John Doe"
}
```

**Example Response** (201 Created):
```json
{
  "id": "clx789...",
  "userName": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### POST /builds/:buildId/add

Add a part to a build.

**Method**: `POST`

**URL Parameters**:
- `buildId` (string): Build ID

**Admin Token Required**: No

**Request Body**:
```json
{
  "partId": "clx123...",
  "slotCategory": "engine",
  "quantity": 1
}
```

**Example Response** (201 Created):
```json
{
  "id": "clx999...",
  "buildId": "clx789...",
  "partId": "clx123...",
  "slotCategory": "engine",
  "quantity": 1,
  "part": {
    "id": "clx123...",
    "name": "Predator 212 Engine",
    "sku": "PRED212",
    "brand": "Harbor Freight",
    "category": "engine",
    "description": null,
    "price": 149.99,
    "imageUrls": [],
    "compatibilityProfiles": [...]
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Build not found"
}
```
or
```json
{
  "error": "Part not found"
}
```

---

### GET /builds/:buildId

Get a build with all items.

**Method**: `GET`

**URL Parameters**:
- `buildId` (string): Build ID

**Admin Token Required**: No

**Example Request**:
```
GET /builds/clx789...
```

**Example Response**:
```json
{
  "buildId": "clx789...",
  "items": [
    {
      "id": "clx999...",
      "part": {
        "id": "clx123...",
        "name": "Predator 212 Engine",
        "sku": "PRED212",
        "brand": "Harbor Freight",
        "category": "engine",
        "description": null,
        "price": 149.99,
        "imageUrls": [],
        "compatibilityProfiles": [...]
      },
      "slotCategory": "engine",
      "quantity": 1
    }
  ]
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Build not found"
}
```

---

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Validation error
  ```json
  {
    "error": "Validation error",
    "details": [...]
  }
  ```

- **401 Unauthorized**: Missing or invalid admin token
  ```json
  {
    "error": "Unauthorized"
  }
  ```

- **404 Not Found**: Resource not found
  ```json
  {
    "error": "Part not found"
  }
  ```

- **500 Internal Server Error**: Server error
  ```json
  {
    "error": "Internal server error"
  }
  ```

