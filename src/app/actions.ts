"use server";

import { generateDeveloperResponse } from "@/ai/flows/generate-example-code";
import type { DeveloperResponseOutput } from "@/ai/flows/generate-example-code";

const YAKIHONNE_API_DOCS = `
# YakiHonne Software API v2.0 - Comprehensive Documentation

## 1. Introduction

Welcome to the YakiHonne API v2.0! This API provides programmatic access to manage your YakiHonne resources, including Widgets, Gadgets, and Doodads. It's built on REST principles, with predictable resource-oriented URLs, and uses standard HTTP response codes and authentication.

Our goal is to provide a powerful and easy-to-use interface for developers to integrate YakiHonne into their applications.

## 2. Getting Started

### 2.1. Authentication

All requests to the YakiHonne API must be authenticated using an API Key. You can generate API keys from your YakiHonne developer dashboard.

To authenticate, include your API key in the \`Authorization\` header of your requests, using the Bearer token scheme.

**Header Format:** \`Authorization: Bearer YOUR_API_KEY\`

Requests that are not authenticated will result in a \`401 Unauthorized\` error.

**Example Authentication Request:**
\`\`\`shell
curl "https://api.yakihonne.com/v2/users/me" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

### 2.2. API Versioning

The current version of the API is **v2**. The version is included in the URL path for all endpoints (e.g., \`/v2/widgets\`). We recommend all new integrations use this version. We will announce any future breaking changes and release them under a new version number.

### 2.3. Data Format

The YakiHonne API exclusively uses JSON for all request and response bodies. Ensure you set the \`Content-Type\` header to \`application/json\` for all \`POST\`, \`PUT\`, and \`PATCH\` requests.

## 3. Core Resources

### 3.1. The Widget Object
A widget is a primary resource in the YakiHonne ecosystem. It represents a configurable component that can be activated and customized.

**Attributes:**
- \`id\` (string): Unique identifier for the widget (e.g., \`widget_abc123\`).
- \`name\` (string): A user-defined name for the widget.
- \`type\` (string): The type of widget. Can be \`standard\`, \`premium\`, or \`enterprise\`.
- \`is_active\` (boolean): A flag indicating if the widget is currently active.
- \`configuration\` (object): A key-value map for widget-specific settings.
- \`created_at\` (string): The ISO 8601 timestamp of when the widget was created.
- \`updated_at\` (string): The ISO 8601 timestamp of the last update.

**Example Widget Object:**
\`\`\`json
{
  "id": "widget_abc123",
  "name": "My First Premium Widget",
  "type": "premium",
  "is_active": true,
  "configuration": {
    "theme": "dark",
    "retries": 3
  },
  "created_at": "2024-01-15T11:30:00Z",
  "updated_at": "2024-01-16T09:00:00Z"
}
\`\`\`

### 3.2. The Gadget Object
A gadget is a simpler resource, often used in conjunction with widgets.

**Attributes:**
- \`id\` (string): Unique identifier for the gadget.
- \`name\` (string): The name of the gadget.
- \`linked_widget_id\` (string, optional): The ID of a widget this gadget is associated with.

## 4. API Endpoints

All endpoints are prefixed with \`https://api.yakihonne.com/v2\`.

### 4.1. Users

#### Get Authenticated User
- **GET /users/me**
- Retrieves the user object associated with the provided API key.
- **Returns:** A user object.

### 4.2. Widgets

#### List All Widgets
- **GET /widgets**
- Returns a paginated list of widgets for the authenticated user.
- **Query Parameters:**
  - \`limit\` (integer, optional, default: 20, max: 100): Number of widgets to return.
  - \`offset\` (integer, optional, default: 0): Number of widgets to skip for pagination.
  - \`type\` (string, optional): Filter widgets by type (\`standard\`, \`premium\`).
- **Returns:** A list of widget objects.

#### Create a Widget
- **POST /widgets**
- Creates a new widget.
- **Body Parameters:**
  - \`name\` (string, required): The name of the widget.
  - \`type\` (string, optional, default: 'standard'): \`standard\`, \`premium\`, or \`enterprise\`.
  - \`configuration\` (object, optional): Custom settings.
- **Returns:** The newly created widget object.

#### Get a Single Widget
- **GET /widgets/{id}**
- Retrieves a specific widget by its ID.
- **Path Parameters:**
  - \`id\` (string, required): The ID of the widget.
- **Returns:** A widget object.

#### Update a Widget
- **PATCH /widgets/{id}**
- Updates specific fields of a widget.
- **Body Parameters:**
  - \`name\` (string, optional): The new name.
  - \`is_active\` (boolean, optional): Activate or deactivate the widget.
  - \`configuration\` (object, optional): Update settings. Note: This will merge with existing configuration, not replace it.
- **Returns:** The updated widget object.

#### Delete a Widget
- **DELETE /widgets/{id}**
- Permanently deletes a widget. This action cannot be undone.
- **Returns:** A \`204 No Content\` response on success.

### 4.3. Gadgets

#### List Gadgets for a Widget
- **GET /widgets/{widget_id}/gadgets**
- Returns a list of all gadgets associated with a specific widget.
- **Path Parameters:**
  - \`widget_id\` (string, required): The ID of the parent widget.
- **Returns:** A list of gadget objects.

#### Create a Gadget
- **POST /gadgets**
- Creates a new gadget.
- **Body Parameters:**
  - \`name\` (string, required): The name of the gadget.
  - \`linked_widget_id\` (string, optional): ID of the widget to link to.
- **Returns:** The newly created gadget object.


## 5. Advanced Topics

### 5.1. Rate Limiting
To ensure fair usage and stability, the API is rate-limited.
- **Limit:** 120 requests per minute per authenticated user.
- **Response:** If you exceed the limit, you will receive a \`429 Too Many Requests\` status code.
- **Headers:** Check the \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, and \`X-RateLimit-Reset\` headers in the response to monitor your usage. The reset time is a UNIX timestamp.

### 5.2. Error Handling
The API uses standard HTTP status codes to indicate success or failure. Error responses include a JSON body with more details.

**Common Status Codes:**
- \`200 OK\`: Request successful.
- \`201 Created\`: Resource created successfully.
- \`204 No Content\`: Request successful, no body returned (e.g., for DELETE).
- \`400 Bad Request\`: Invalid request, check your parameters or body.
- \`401 Unauthorized\`: Authentication failed.
- \`403 Forbidden\`: You don't have permission to access this resource.
- \`404 Not Found\`: The requested resource does not exist.
- \`429 Too Many Requests\`: Rate limit exceeded.
- \`500 Internal Server Error\`: An unexpected error occurred on our end.

**Example Error Response:**
\`\`\`json
{
  "error": {
    "code": "invalid_parameter",
    "message": "The 'name' parameter must be a non-empty string."
  }
}
\`\`\`

### 5.3. Webhooks
Webhooks allow you to receive real-time notifications about events happening in your YakiHonne account.

- **Configuration:** Set up webhook endpoints in your developer dashboard.
- **Events:** We support events like \`widget.created\`, \`widget.updated\`, and \`widget.deleted\`.
- **Payload:** We will send a \`POST\` request to your URL with a JSON payload containing the event type and the relevant data object.

**Example Webhook Payload (\`widget.updated\`):**
\`\`\`json
{
  "event_id": "evt_12345",
  "event_type": "widget.updated",
  "created_at": "2024-02-20T14:00:00Z",
  "data": {
    "object": {
      "id": "widget_abc123",
      "name": "Updated Widget Name",
      "is_active": false,
      ...
    }
  }
}
\`\`\`
To verify webhook authenticity, we include a \`YakiHonne-Signature\` header in each request. You can find instructions on how to verify this signature in your dashboard.
`;

export async function askQuestionAction(question: string): Promise<DeveloperResponseOutput & { error?: string }> {
  try {
    if (!question) {
      return { error: "Question cannot be empty.", answer: "", codeSnippet: null, citation: null };
    }

    const result = await generateDeveloperResponse({
      query: question,
      documentation: YAKIHONNE_API_DOCS,
    });
    
    return result;
  } catch (e: any) {
    console.error(e);
    // This is a common error from Genkit when the model refuses to answer.
    if (e.message?.includes('The model refused to respond to the prompt')) {
        return {
            answer: "I am unable to provide a response for this request. Please try rephrasing your query or ask about a different topic related to the YakiHonne API.",
            codeSnippet: null,
            citation: null,
        };
    }
    return {
      error: e.message || "An unexpected error occurred. Please try again.",
      answer: "",
      codeSnippet: null,
      citation: null,
    };
  }
}
