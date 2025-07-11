# YakiHonne Smart Widget Development

This documentation provides guidelines for building and integrating Smart Widgets with the YakiHonne platform.

## Dynamic Smart Widgets (Using Endpoints)

Dynamic Smart Widgets are rendered from an endpoint URL. The widget's content and behavior are determined by the response from this endpoint.

### Dependencies

To create a dynamic widget, you'll need the following dependencies:

- `nostr-tools`: For creating, signing, and managing Nostr events.
- `dotenv`: For handling environment variables.

### Root Endpoint

Your project should have a root endpoint that returns an HTML document. This document should include a `<head>` section with metadata about the widget.

**Example: `index.js`**

```javascript
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My First Smart Widget</title>
        <meta name="description" content="A simple smart widget.">
        <meta name="image" content="https://placehold.co/800x400.png">
        <meta name="render" content="iframe">
        <meta name="params" content="{}">
      </head>
      <body>
        <h1>Hello from my Smart Widget!</h1>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(\`Server is running on port \${port}\`);
});
```

### Signing and Publishing

To publish your widget, you need to create a Nostr event with `kind: 31234`. This event includes tags that define the widget's properties, such as its name, URL, and rendering type.

**Example: `publish.js`**

```javascript
import "dotenv/config";
import { finishEvent, getPublicKey,nip19 } from "nostr-tools";

const relay = "wss://relay.current.fyi";
const privateKey = process.env.PRIVATE_KEY;

async function signAndPublish(widgetEvent) {
  widgetEvent.pubkey = getPublicKey(privateKey);
  const signedEvent = finishEvent(widgetEvent, privateKey);

  const ws = new WebSocket(relay);
  ws.onopen = () => {
    console.log("WebSocket connected");
    ws.send(JSON.stringify(["EVENT", signedEvent]));
    console.log("Published event:", signedEvent);
    ws.close();
  };
  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
}

const widget = {
  kind: 31234,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ["d", "my-first-widget"],
    ["url", "http://localhost:3000"],
    ["name", "My First Smart Widget"],
    ["description", "A simple smart widget."],
    ["image", "https://placehold.co/800x400.png"],
    ["render", "iframe"],
    ["params", "{}"],
  ],
  content: "",
};

signAndPublish(widget);
```

## Action and Tool Mini Apps (Using a Manifest)

Action and Tool Mini Apps are lightweight web applications that integrate with a host Nostr client. They are defined by a `widget.json` manifest file.

### Manifest File

The `widget.json` file describes your mini app's properties.

**Example: `.well-known/widget.json`**

```json
{
  "name": "MyMiniApp",
  "content": "https://your-mini-app-url.com",
  "picture": "https://placehold.co/200x200.png",
  "about": "A mini app for demonstrating actions and tools.",
  "type": "tool",
  "tags": ["miniapp", "example", "tool"]
}
```

### Communication with Host App

Use the `smart-widget-handler` package to facilitate communication between your mini app and the host client.

**Installation:**
```bash
npm install smart-widget-handler
```

### Action Mini Apps

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

### Tool Mini Apps

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
