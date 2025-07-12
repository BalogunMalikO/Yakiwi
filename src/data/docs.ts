export const YAKIHONNE_API_DOCS = `
# YakiHonne Smart Widget Mini App Documentation

## Introduction
Smart Widget Mini Apps are lightweight web applications designed to run within Nostr clients that support them, like YakiHonne. They provide a way to extend the functionality of the host client by offering specialized tools, content, or interactive experiences.

These mini-apps run in their own isolated iframe but can communicate with the host client through a postMessage-based API provided by the \`smart-widget-handler\` library.

## Key Concepts

### 1. Host Client
The main Nostr client application (e.g., YakiHonne) that embeds and manages the Smart Widget Mini App.

### 2. Mini App
Your web application, which is loaded into an iframe by the host client.

### 3. \`smart-widget-handler\` Library
A JavaScript library that simplifies the communication between the host client and the mini app. It provides a standardized way to send and receive messages, handle different event types, and manage the mini app lifecycle.

## Mini App Types
There are two primary types of Smart Widget Mini Apps, distinguished by their \`kind\` in the Nostr event used to define them.

### \`kind: 31337\` - Action Widgets
- **Purpose**: Designed to perform a specific action, often related to composing a new Nostr note.
- **Workflow**:
    1. A user in the host client (e.g., YakiHonne) opens an Action Widget.
    2. The host may send an existing Nostr event as context to the widget.
    3. The widget performs some logic (e.g., generates text, analyzes content, creates a poll).
    4. The widget sends the resulting content (e.g., a string of text) back to the host.
    5. The host client pre-fills its note composer with the content received from the widget, allowing the user to review and publish it.
- **Example Use Cases**: AI-powered text generation, poll creation tools, meme generators.

### \`kind: 31338\` - Tool Widgets
- **Purpose**: Provide a more general-purpose tool or experience that may or may not be directly related to note composition.
- **Workflow**:
    1. A user opens a Tool Widget from a dedicated menu or section in the host client.
    2. The widget can operate independently, fetching data, displaying information, or providing an interactive experience.
    3. Tool Widgets can still communicate with the host but are not typically tied to the note composition flow.
- **Example Use Cases**: Nostr-based games, data explorers, contact list managers, media players.

## Communication API (\`smart-widget-handler\`)

The library handles the low-level \`postMessage\` calls and provides a clear, event-driven interface.

### Initializing the Mini App
In your mini app's main component, you must signal to the host that it's ready.

\`\`\`javascript
import SWhandler from "smart-widget-handler";
import * as React from "react";

React.useEffect(() => {
  // Signal to the host client that the mini app is ready to receive messages.
  SWhandler.client.ready();
}, []);
\`\`\`

### Listening for Events from the Host
The host can send various types of information to your mini app.

\`\`\`javascript
// Listen for any events from the host
const listener = SWhandler.client.listen((event) => {
  // The host can send a Nostr event as context (common for Action Widgets)
  if (event.kind === "nostr-event") {
    const noteContent = event.data?.event?.content;
    if (noteContent) {
      // Do something with the content
      setQuestion(noteContent);
    }
  }

  // The host can send its origin for security purposes
  if (event.kind === 'user-metadata') {
    if(event.data?.host_origin) {
      setHostOrigin(event.data.host_origin)
    }
  }
});

// Clean up the listener when the component unmounts
return () => {
  listener?.close();
};
\`\`\`

### Sending Content Back to the Host (for Action Widgets)
After processing, an Action Widget sends the final content back to the host's note composer.

\`\`\`javascript
import SWhandler from "smart-widget-handler";

const handleSendToHost = (text, hostOrigin) => {
  if (hostOrigin) {
    // The \`sendContext\` method sends a string to the host's composer.
    SWhandler.client.sendContext(text, hostOrigin);
  }
};
\`\`\`

## Summary
- **Action Widgets (\`31337\`)** are for "do one thing and return text" tasks, integrating directly with the note composer.
- **Tool Widgets (\`31338\`)** are for more general-purpose, standalone experiences within the client.
- The **\`smart-widget-handler\`** library is essential for managing the communication lifecycle between your app and the host client.
`;
