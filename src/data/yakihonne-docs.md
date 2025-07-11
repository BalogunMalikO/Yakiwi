# YakiHonne API Documentation

This document provides an overview of the YakiHonne API for building Smart Widgets and Mini Apps on Nostr.

## Smart Widget Mini Apps

Smart Widget Mini Apps are lightweight web applications that extend functionality within Nostr clients. They run in their own context but can communicate with the host Nostr client to provide seamless integration.

There are two main types of mini apps: Action and Tool.

### Action Mini Apps. Example
Action mini apps can only receive data from the host application. They are ideal for widgets that perform a specific action without needing to return data.

Example:

```javascript
// In an Action Mini App
import SWhandler from "smart-widget-handler";
import { useState, useEffect } from "react";

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

### Tool Mini Apps. Example
Tool mini apps can both receive data from and return data to the host application. This makes them suitable for widgets that need to provide information back to the host app.

Example:

```javascript
// In a Tool Mini App
import SWhandler from "smart-widget-handler";
import { useState, useEffect } from "react";

function ToolApp() {.
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
