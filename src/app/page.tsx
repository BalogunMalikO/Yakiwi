"use client";

import { QAPanel } from "@/components/qa-panel";
import { Sparkles } from "lucide-react";
import SWhandler from "smart-widget-handler";
import * as React from "react";

export default function Home() {
  const [initialQuestion, setInitialQuestion] = React.useState<string | undefined>();
  const [hostOrigin, setHostOrigin] = React.useState<string | undefined>();

  React.useEffect(() => {
    // Signal to the host client that the mini app is ready
    SWhandler.client.ready();

    // Listen for messages from the host client
    const listener = SWhandler.client.listen((event) => {
      // The host can send a Nostr event as context
      if (event.kind === "nostr-event") {
        const content = event.data?.event?.content;
        if (content) {
          // Set the question from the event content
          setInitialQuestion(content);
        }
      }
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
  }, []);
  
  const handleResponse = (response: any) => {
    if(hostOrigin) {
      // Send the AI's answer back to the host client
      let context = response.answer;
      if (response.codeSnippet) {
        context += `\n\n\`\`\`\n${response.codeSnippet}\n\`\`\``;
      }
      SWhandler.client.sendContext(context, hostOrigin);
    }
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-2 text-4xl font-bold text-foreground sm:text-5xl font-headline">
            <Sparkles className="h-8 w-8 text-accent" />
            YaKiwi
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your friendly AI assistant for the Yakihonne API
          </p>
        </header>
        <QAPanel 
          initialQuestion={initialQuestion}
          onApiResponse={handleResponse} 
        />
      </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Powered by GenAI</p>
      </footer>
    </main>
  );
}
