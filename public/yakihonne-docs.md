# Dynamic Basic Smart Widget Boiler Plate
A boiler plate to start building dynamic nostr smart widgets

## Installation
```bash
npm install
npm run dev
```

## Dependencies
- axios
- canvas
- cors
- express
- nostr-tools
- puppeteer
- smart-widget-builder
- ws

## example
This is an example of a smart widget starting point that sends back a nostr event of a valid signed smart widget

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
## General
- All endpoints should always return a valid smart widget event
- All endpoints except for the starting endpoint should not be published for fast response and avoid unnecessary event publishing

# Action/Tool widgets
This guide explains how to build mini web applications that can be converted into Nostr smart widgets using the smart-widget-handler package.

## Overview
Smart Widget Mini Apps are lightweight web applications that extend functionality within Nostr clients. They run in their own context but can communicate with the host Nostr client to provide seamless integration.

## Types of Mini Apps
Nostr clients recognize two types of mini apps:

### Action Mini Apps
- **Purpose**: Perform actions with data from the Nostr client
- **Data flow**: One-way (client → mini app)
- **Use case**: Mini games, formatting tools

### Tool Mini Apps
- **Purpose**: Process data and return results to the Nostr client
- **Data flow**: Two-way (client ↔ mini app)
- **Use case**: Text generators, data analysis, content lookup

**Note**: The distinction between Action and Tool is primarily to help Nostr clients handle the widget's UI and data flow appropriately and to provide the necessary UX for each type.

## Quick Start
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
## Integration with Host App
The `smart-widget-handler` package provides a bridge for communication between your mini app and the host application.

### Installation
If not installed:
```bash
npm install smart-widget-handler
```
### Basic Usage
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

## Action Mini Apps vs. Tool Mini Apps

### Action Mini Apps. Example
Action mini apps can only receive data from the host application. They are ideal for widgets that perform a specific action without needing to return data.

Example:
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

### Tool Mini Apps. Example
Tool mini apps can both receive data from and return data to the host application. This makes them suitable for widgets that need to provide information back to the host app.

Example:
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

## Publishing Nostr Events
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

## Widget Manifest
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

## Deployment and Publication Workflow
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

## Benefits of Mini Apps
- **Web3/Web2/Nostr Integration**: Create apps that bridge different ecosystems
- **FOSS Projects**: Leverage open-source libraries and frameworks
- **Customizability**: Build widgets to suit specific needs
- **Discoverability**: Widget manifest makes your mini apps discoverable

## Common Use Cases
### Action Mini Apps
- Note composers with special formatting
- Media uploaders
- Event creators
- NFT minters
- Payment widgets

### Tool Mini Apps
- Analytics providers
- Search tools
- Data aggregators
- Content recommendation engines
- Information lookup services
