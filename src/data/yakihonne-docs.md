# YakiHonne Software API v2.0 - Comprehensive Documentation

## 1. Introduction

Welcome to the YakiHonne API v2.0! This API provides programmatic access to manage your YakiHonne resources, including Widgets, Gadgets, and Doodads. It's built on REST principles, with predictable resource-oriented URLs, and uses standard HTTP response codes and authentication.

Our goal is to provide a powerful and easy-to-use interface for developers to integrate YakiHonne into their applications.

## 2. Getting Started

### 2.1. Authentication

All requests to the YakiHonne API must be authenticated using an API Key. You can generate API keys from your YakiHonne developer dashboard.

To authenticate, include your API key in the `Authorization` header of your requests, using the Bearer token scheme.

**Header Format:** `Authorization: Bearer YOUR_API_KEY`

Requests that are not authenticated will result in a `401 Unauthorized` error.

**Example Authentication Request:**
```shell
curl "https://api.yakihonne.com/v2/users/me" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 2.2. API Versioning

The current version of the API is **v2**. The version is included in the URL path for all endpoints (e.g., `/v2/widgets`). We recommend all new integrations use this version. We will announce any future breaking changes and release them under a new version number.

### 2.3. Data Format

The YakiHonne API exclusively uses JSON for all request and response bodies. Ensure you set the `Content-Type` header to `application/json` for all `POST`, `PUT`, and `PATCH` requests.

## 3. Core Resources

### 3.1. The Widget Object
A widget is a primary resource in the YakiHonne ecosystem. It represents a configurable component that can be activated and customized.

**Attributes:**
- `id` (string): Unique identifier for the widget (e.g., `widget_abc123`).
- `name` (string): A user-defined name for the widget.
- `type` (string): The type of widget. Can be `standard`, `premium`, or `enterprise`.
- `is_active` (boolean): A flag indicating if the widget is currently active.
- `configuration` (object): A key-value map for widget-specific settings.
- `created_at` (string): The ISO 8601 timestamp of when the widget was created.
- `updated_at` (string): The ISO 8601 timestamp of the last update.

**Example Widget Object:**
```json
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
```

### 3.2. The Gadget Object
A gadget is a simpler resource, often used in conjunction with widgets.

**Attributes:**
- `id` (string): Unique identifier for the gadget.
- `name` (string): The name of the gadget.
- `linked_widget_id` (string, optional): The ID of a widget this gadget is associated with.

## 4. API Endpoints

All endpoints are prefixed with `https://api.yakihonne.com/v2`.

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
  - `limit` (integer, optional, default: 20, max: 100): Number of widgets to return.
  - `offset` (integer, optional, default: 0): Number of widgets to skip for pagination.
  - `type` (string, optional): Filter widgets by type (`standard`, `premium`).
- **Returns:** A list of widget objects.

#### Create a Widget
- **POST /widgets**
- Creates a new widget.
- **Body Parameters:**
  - `name` (string, required): The name of the widget.
  - `type` (string, optional, default: 'standard'): `standard`, `premium`, or `enterprise`.
  - `configuration` (object, optional): Custom settings.
- **Returns:** The newly created widget object.

#### Get a Single Widget
- **GET /widgets/{id}**
- Retrieves a specific widget by its ID.
- **Path Parameters:**
  - `id` (string, required): The ID of the widget.
- **Returns:** A widget object.

#### Update a Widget
- **PATCH /widgets/{id}**
- Updates specific fields of a widget.
- **Body Parameters:**
  - `name` (string, optional): The new name.
  - `is_active` (boolean, optional): Activate or deactivate the widget.
  - `configuration` (object, optional): Update settings. Note: This will merge with existing configuration, not replace it.
- **Returns:** The updated widget object.

#### Delete a Widget
- **DELETE /widgets/{id}**
- Permanently deletes a widget. This action cannot be undone.
- **Returns:** A `204 No Content` response on success.

### 4.3. Gadgets

#### List Gadgets for a Widget
- **GET /widgets/{widget_id}/gadgets**
- Returns a list of all gadgets associated with a specific widget.
- **Path Parameters:**
  - `widget_id` (string, required): The ID of the parent widget.
- **Returns:** A list of gadget objects.

#### Create a Gadget
- **POST /gadgets**
- Creates a new gadget.
- **Body Parameters:**
  - `name` (string, required): The name of the gadget.
  - `linked_widget_id` (string, optional): ID of the widget to link to.
- **Returns:** The newly created gadget object.


## 5. Advanced Topics

### 5.1. Rate Limiting
To ensure fair usage and stability, the API is rate-limited.
- **Limit:** 120 requests per minute per authenticated user.
- **Response:** If you exceed the limit, you will receive a `429 Too Many Requests` status code.
- **Headers:** Check the `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers in the response to monitor your usage. The reset time is a UNIX timestamp.

### 5.2. Error Handling
The API uses standard HTTP status codes to indicate success or failure. Error responses include a JSON body with more details.

**Common Status Codes:**
- `200 OK`: Request successful.
- `201 Created`: Resource created successfully.
- `204 No Content`: Request successful, no body returned (e.g., for DELETE).
- `400 Bad Request`: Invalid request, check your parameters or body.
- `401 Unauthorized`: Authentication failed.
- `403 Forbidden`: You don't have permission to access this resource.
- `404 Not Found`: The requested resource does not exist.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: An unexpected error occurred on our end.

**Example Error Response:**
```json
{
  "error": {
    "code": "invalid_parameter",
    "message": "The 'name' parameter must be a non-empty string."
  }
}
```

### 5.3. Webhooks
Webhooks allow you to receive real-time notifications about events happening in your YakiHonne account.

- **Configuration:** Set up webhook endpoints in your developer dashboard.
- **Events:** We support events like `widget.created`, `widget.updated`, and `widget.deleted`.
- **Payload:** We will send a `POST` request to your URL with a JSON payload containing the event type and the relevant data object.

**Example Webhook Payload (`widget.updated`):**
```json
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
```
To verify webhook authenticity, we include a `YakiHonne-Signature` header in each request. You can find instructions on how to verify this signature in your dashboard.

## 6. Building Dynamic Smart Widgets

This section covers the boilerplate for starting a dynamic Nostr smart widget.

### 6.1. Installation

```bash
npm install
npm run dev
```

### 6.2. Dependencies
- `axios`
- `canvas`
- `cors`
- `express`
- `nostr-tools`
- `puppeteer`
- `smart-widget-builder`
- `ws`

### 6.3. Example Usage

This is an example of a smart widget starting point that sends back a Nostr event of a valid signed smart widget.

```javascript
/*
Root endpoint, should be the start of the smart widget.
Add more endpoints to use them in a POST type buttons for more widget heirarchy.
*/
router.post("/", async (req, res) => {
  try {
    /*
      Initialize a Smart Widget instance, a relays URL list is optional.
      Make sure to add your secret key in the .env file under the key of SECRET_KEY to ensure all widgets are signed under the same key.
    */
    let SMART_WIDGET = new SW();

    /*
     Smart widget components (Image, Input, Button).
     */
    let SWImage = new Image(
      "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-v2/dad-jokes.png"
    );
    let SWButton = new Button(
      1,
      "Give me a joke 😁",
      "post",
      getMainURL() + "/joke"
    );

    /*
    Smart widget component set, it accepts one image, one optional input, and a max of 6 buttons ordered respectively from 1 to 6.
    */
    let SWComp = new SWComponentsSet([SWImage, SWButton]);

    /*
    An optional static Smart widget event identifier, but highly recommended on the root Smart widget.
    Make sure to use a unique string.
    */
    let identifier = "a99a8857ce9ca5a4237";

    /*
    To sign a Smart widget event, skip this step if wanting to publish the event.
    */
    let signedEvent = await SMART_WIDGET.signEvent(
      SWComp,
      "Funny jokes",
      identifier
    );

    /*
    To publish a Smart widget event, skip this step if not wanting to publish the event.
    For a best practice, make sure to publish only the root widget.
    the init() method is required before publishing the Smart widget.
    */
    let publishedEvent;
    if (process.env.NODE_ENV === "production")
      publishedEvent = await SMART_WIDGET.publish(SWComp, "Funny jokes", identifier);

     /*
    Always return a valid Smart widget event.
    */
    res.send(publishedEvent ? publishedEvent.event : signedEvent.event);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server error" });
  }
});
```

### 6.4. General Notes
- All endpoints should always return a valid smart widget event.
- All endpoints except for the starting endpoint should not be published for fast response and to avoid unnecessary event publishing.

## 7. Action/Tool Widgets
This guide explains how to build mini web applications that can be converted into Nostr smart widgets using the smart-widget-handler package.

### Overview
Smart Widget Mini Apps are lightweight web applications that extend functionality within Nostr clients. They run in their own context but can communicate with the host Nostr client to provide seamless integration.

### Types of Mini Apps
Nostr clients recognize two types of mini apps:

#### Action Mini Apps
- **Purpose**: Perform actions with data from the Nostr client
- **Data flow**: One-way (client → mini app)
- **Use case**: Mini games, formatting tools

#### Tool Mini Apps
- **Purpose**: Process data and return results to the Nostr client
- **Data flow**: Two-way (client ↔ mini app)
- **Use case**: Text generators, data analysis, content lookup

**Note**: The distinction between Action and Tool is primarily to help Nostr clients handle the widget's UI and data flow appropriately and to provide the necessary UX for each type.

### Quick Start
Create a new project:
```bash
mkdir my-nostr-widget
cd my-nostr-widget
npm init -y
npm install react react-dom smart-widget-handler
npm install -D vite @vitejs/plugin-react
```
Create a basic structure:
```
my-nostr-widget/
├── public/
│   └── .well-known/
│       └── widget.json
├── src/
│   ├── App.jsx
│   └── main.jsx
└── package.json
```
### Integration with Host App
The `smart-widget-handler` package provides a bridge for communication between your mini app and the host application.

#### Installation
If not installed:
```bash
npm install smart-widget-handler
```
#### Basic Usage
```javascript
import SWhandler from "smart-widget-handler";

// Initialize communication with host app
useEffect(() => {
  SWhandler.client.ready();
}, []);

// Listen for messages from host app
useEffect(() => {
  let listener = SWhandler.client.listen((event) => {
    if (event.kind === "user-metadata") {
      // Handle user metadata
      setUserMetadata(event.data?.user);
      setHostOrigin(event.data?.host_origin);
    }
    if (event.kind === "err-msg") {
      // Handle error messages
      setErrorMessage(event.data);
    }
    if (event.kind === "nostr-event") {
      // Handle Nostr events
      const { pubkey, id } = event.data?.event || {};
      // Process event data
    }
  });

  return () => {
    // Clean up listener when component unmounts
    listener?.close();
  }
}, []);
```

### Action Mini Apps vs. Tool Mini Apps

#### Action Mini Apps
Action mini apps can only receive data from the host application. They are ideal for widgets that perform a specific action without needing to return data.

**Example:**
```javascript
// In an Action Mini App
import SWhandler from "smart-widget-handler";

function ActionApp() {
  const [userMetadata, setUserMetadata] = useState(null);
  
  useEffect(() => {
    SWhandler.client.ready();
    
    const listener = SWhandler.client.listen((event) => {
      if (event.kind === "user-metadata") {
        setUserMetadata(event.data?.user);
      }
    });
    
    return () => listener?.close();
  }, []);
  
  return (
    <div>
      {userMetadata ? (
        <div>
          <h1>Hello, {userMetadata.display_name || userMetadata.name}</h1>
          <button onClick={performAction}>Perform Action</button>
        </div>
      ) : (
        <div>Loading user data...</div>
      )}
    </div>
  );
}
```

#### Tool Mini Apps
Tool mini apps can both receive data from and return data to the host application. This makes them suitable for widgets that need to provide information back to the host app.

**Example:**
```javascript
// In a Tool Mini App
import SWhandler from "smart-widget-handler";

function ToolApp() {
  const [userMetadata, setUserMetadata] = useState(null);
  const [hostOrigin, setHostOrigin] = useState(null);
  
  useEffect(() => {
    SWhandler.client.ready();
    
    const listener = SWhandler.client.listen((event) => {
      if (event.kind === "user-metadata") {
        setUserMetadata(event.data?.user);
        setHostOrigin(event.data?.host_origin);
      }
    });
    
    return () => listener?.close();
  }, []);
  
  const sendDataToHost = (data) => {
    if (hostOrigin) {
      // Send context data back to the host app
      SWhandler.client.sendContext(data, hostOrigin);
    }
  };
  
  return (
    <div>
      {userMetadata ? (
        <div>
          <h1>Hello, {userMetadata.display_name || userMetadata.name}</h1>
          <button onClick={() => sendDataToHost("This is data from the tool mini app")}>
            Send Data to Host
          </button>
        </div>
      ) : (
        <div>Loading user data...</div>
      )}
    </div>
  );
}
```

### Publishing Nostr Events
Mini apps can request the host application to sign and publish Nostr events:
```javascript
const signEvent = (tempEvent) => {
  if (hostOrigin) {
    SWhandler.client.requestEventPublish(tempEvent, hostOrigin);
  }
};

// Example of creating and publishing a simple note
const publishNote = () => {
  const eventTemplate = {
    kind: 1, // Regular note
    content: "Hello from my mini app!",
    tags: [["t", "miniapp"], ["t", "test"]]
  };
  
  signEvent(eventTemplate);
};
```

### Widget Manifest
To make your mini app discoverable as a widget, you need to create a manifest file at `/.well-known/widget.json`:
```json
{
  "pubkey": "your-nostr-pubkey-in-hex",
  "widget": {
    "title": "My Amazing Widget",
    "appUrl": "https://your-app-url.com",
    "iconUrl": "https://your-app-url.com/icon.png",
    "imageUrl": "https://your-app-url.com/thumbnail.png",
    "buttonTitle": "Launch Widget",
    "tags": ["tool", "utility", "nostr"]
  }
}
```
This manifest serves two important purposes:
1.  Verifies the authenticity of your mini app
2.  Provides metadata for Nostr clients to display your widget

### Deployment and Publication Workflow
1.  **Build your mini app**
2.  **Deploy to a hosting service**
    -   Vercel, Netlify, GitHub Pages, etc.
    -   Ensure the `/.well-known/widget.json` file is accessible
3.  **Register with YakiHonne Widget Editor**
    -   Go to the YakiHonne Widget Editor
    -   Select Action or Tool based on your mini app type
    -   Enter your mini app URL
    -   The editor will fetch your manifest and validate it
    -   Configure any additional settings
4.  **Publish to Nostr**

### Benefits of Mini Apps
- **Web3/Web2/Nostr Integration**: Create apps that bridge different ecosystems
- **FOSS Projects**: Leverage open-source libraries and frameworks
- **Customizability**: Build widgets to suit specific needs
- **Discoverability**: Widget manifest makes your mini apps discoverable

### Common Use Cases
#### Action Mini Apps
- Note composers with special formatting
- Media uploaders
- Event creators
- NFT minters
- Payment widgets

#### Tool Mini Apps
- Analytics providers
- Search tools
- Data aggregators
- Content recommendation engines
- Information lookup services
```