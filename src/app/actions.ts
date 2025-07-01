"use server";

import { answerQuestionFromDocs } from "@/ai/flows/answer-question-from-docs";
import type { AnswerQuestionFromDocsOutput } from "@/ai/flows/answer-question-from-docs";

const YAKIHONNE_API_DOCS = `
# Yakihonne API Documentation v1.2

## 1. Introduction
Welcome to the Yakihonne API! This document provides a comprehensive guide to interacting with our platform to manage your resources like Widgets and Gadgets. Our API is RESTful and uses standard HTTP conventions.

## 2. Authentication
All API requests must be authenticated. You can authenticate by providing your API key in the 'Authorization' header.
The header should be in the format: 'Authorization: Bearer YOUR_API_KEY'.
Requests without authentication will fail with a 401 Unauthorized status code.

### Example Authentication Request:
\`\`\`
curl "https://api.yakihonne.com/v1/users/me" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

## 3. Data Format
All request and response bodies are formatted as JSON. You should set the 'Content-Type' header to 'application/json' for all POST and PATCH requests.

## 4. Versioning
The API is versioned. The current version is v1. All requests should be made to the /v1/ path. Breaking changes will be introduced in new versions.

## 5. Endpoints

### 5.1. Users

#### Get User
- **GET /v1/users/{id}**
- Retrieves a specific user by their ID. Use 'me' to get the authenticated user.
- **Path Parameters:**
  - \`id\` (string, required): The unique identifier for the user or 'me'.
- **Returns:** A user object.
  \`\`\`json
  {
    "id": "user_123",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "created_at": "2023-10-27T10:00:00Z"
  }
  \`\`\`

### 5.2. Widgets
A widget is a core resource in the Yakihonne platform.

#### Widget Object
The widget object has the following structure:
  \`\`\`json
  {
    "id": "widget_abc",
    "name": "My First Widget",
    "type": "standard",
    "is_active": true,
    "configuration": {
        "setting1": "value1"
    },
    "created_at": "2023-10-27T11:00:00Z"
  }
  \`\`\`

#### List Widgets
- **GET /v1/widgets**
- Returns a list of all widgets for the authenticated user. The widgets are returned sorted by creation date, with the most recent first.
- **Query Parameters:**
  - \`limit\` (integer, optional): The number of widgets to return. Defaults to 20. Maximum is 100.
  - \`offset\` (integer, optional): The number of widgets to skip for pagination.
- **Returns:** An object with a 'data' property containing an array of widget objects.

#### Create a Widget
- **POST /v1/widgets**
- Creates a new widget.
- **Body Parameters:**
  - \`name\` (string, required): The name of the widget.
  - \`type\` (string, optional): The type of widget. Can be 'standard' or 'premium'. Defaults to 'standard'.
  - \`configuration\` (object, optional): A key-value object for widget settings.
- **Returns:** The newly created widget object.

#### Get a Widget
- **GET /v1/widgets/{id}**
- Retrieves a specific widget by its ID.
- **Path Parameters:**
  - \`id\` (string, required): The unique identifier for the widget.
- **Returns:** A widget object.

#### Update a Widget
- **PATCH /v1/widgets/{id}**
- Updates a specific widget. Only the provided fields will be updated.
- **Path Parameters:**
  - \`id\` (string, required): The unique identifier for the widget.
- **Body Parameters:**
  - \`name\` (string, optional): The new name of the widget.
  - \`is_active\` (boolean, optional): Whether the widget is active.
- **Returns:** The updated widget object.

#### Delete a Widget
- **DELETE /v1/widgets/{id}**
- Deletes a specific widget.
- **Path Parameters:**
  - \`id\` (string, required): The unique identifier for the widget.
- **Returns:** A 204 No Content response on success.


### 5.3. Gadgets
Gadgets are another type of resource you can manage.

#### List Gadgets
- **GET /v1/gadgets**
- Returns a list of all gadgets.
- **Returns:** An array of gadget objects.

#### Create a Gadget
- **POST /v1/gadgets**
- Creates a new gadget.
- **Body Parameters:**
  - \`name\` (string, required): The name of the gadget.
- **Returns:** The newly created gadget object.


## 6. Rate Limiting
The API is rate-limited to 100 requests per minute per user. If you exceed this limit, you will receive a 429 Too Many Requests status code. The 'X-RateLimit-Remaining' header indicates how many requests you have left in the current window.

## 7. Error Handling
The API uses standard HTTP status codes to indicate the success or failure of a request. The response body for an error will contain a JSON object with 'error' and 'message' keys.
- \`200 OK\`: The request was successful.
- \`204 No Content\`: The request was successful and there is no content to return.
- \`400 Bad Request\`: The request was malformed (e.g., missing parameters).
- \`401 Unauthorized\`: Authentication failed or was not provided.
- \`404 Not Found\`: The requested resource could not be found.
- \`429 Too Many Requests\`: You have hit the rate limit.
- \`500 Internal Server Error\`: An unexpected error occurred on our servers.

### Example Error Response:
\`\`\`json
{
  "error": "bad_request",
  "message": "The 'name' parameter is required."
}
\`\`\`

## 8. Webhooks
We support webhooks to notify your application of events. You can configure webhook endpoints in your developer dashboard. We will send a POST request to your specified URL with a JSON payload.

### Example Webhook Payload (widget.created):
\`\`\`json
{
  "event_type": "widget.created",
  "data": {
    "id": "widget_xyz",
    "name": "A New Widget",
    ...
  }
}
\`\`\`
`;

export async function askQuestionAction(question: string): Promise<AnswerQuestionFromDocsOutput & { error?: string }> {
  try {
    if (!question) {
      return { error: "Question cannot be empty.", answer: "", citation: "" };
    }

    const result = await answerQuestionFromDocs({
      question,
      documentation: YAKIHONNE_API_DOCS,
    });
    
    return result;
  } catch (e: any) {
    console.error(e);
    // This is a common error from Genkit when the model refuses to answer.
    if (e.message?.includes('The model refused to respond to the prompt')) {
        return {
            answer: "I am unable to answer this question based on the provided documentation. Please try rephrasing your question or ask about a different topic.",
            citation: "No citation available.",
        };
    }
    return {
      error: e.message || "An unexpected error occurred. Please try again.",
      answer: "",
      citation: "",
    };
  }
}
