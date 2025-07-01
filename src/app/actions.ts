"use server";

import { answerQuestionFromDocs } from "@/ai/flows/answer-question-from-docs";
import type { AnswerQuestionFromDocsOutput } from "@/ai/flows/answer-question-from-docs";

const YAKIHONNE_API_DOCS = `
# Yakihonne API Documentation

## 1. Introduction
Welcome to the Yakihonne API! This API allows you to interact with our platform to manage your resources. Our API is RESTful and uses standard HTTP conventions.

## 2. Authentication
All API requests must be authenticated. You can authenticate by providing your API key in the 'Authorization' header.
The header should be in the format: 'Authorization: Bearer YOUR_API_KEY'.
Requests without authentication will fail with a 401 Unauthorized status code.

### Example Authentication Request:
\`\`\`
curl "https://api.yakihonne.com/v1/users/me" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

## 3. Endpoints

### 3.1. Get User
- **GET /v1/users/{id}**
- Retrieves a specific user by their ID. Use 'me' to get the authenticated user.
- **Path Parameters:**
  - \`id\` (string, required): The unique identifier for the user or 'me'.
- **Returns:** A user object containing id, name, and email.

### 3.2. List Widgets
- **GET /v1/widgets**
- Returns a list of all widgets for the authenticated user. The widgets are returned sorted by creation date, with the most recent first.
- **Query Parameters:**
  - \`limit\` (integer, optional): The number of widgets to return. Defaults to 20. Maximum is 100.
  - \`offset\` (integer, optional): The number of widgets to skip for pagination.
- **Returns:** An object with a 'data' property containing an array of widget objects.

## 4. Rate Limiting
The API is rate-limited to 100 requests per minute per user. If you exceed this limit, you will receive a 429 Too Many Requests status code. The 'X-RateLimit-Remaining' header indicates how many requests you have left in the current window.

## 5. Error Handling
The API uses standard HTTP status codes to indicate the success or failure of a request. The response body for an error will contain a JSON object with 'error' and 'message' keys.
- \`200 OK\`: The request was successful.
- \`400 Bad Request\`: The request was malformed (e.g., missing parameters).
- \`401 Unauthorized\`: Authentication failed or was not provided.
- \`404 Not Found\`: The requested resource could not be found.
- \`429 Too Many Requests\`: You have hit the rate limit.
- \`500 Internal Server Error\`: An unexpected error occurred on our servers.
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
