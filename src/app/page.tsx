
"use client";

import { QAPanel } from "@/components/qa-panel";
import { Sparkles } from "lucide-react";
import SWhandler from "smart-widget-handler";
import * as React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
        <div className="mt-8 w-full">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is YaKiwi?</AccordionTrigger>
                <AccordionContent>
                  YaKiwi is an AI assistant designed to help developers with the YakiHonne API. You can ask it questions in plain English or use it to generate ready-to-use Smart Widgets from a simple text description.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I ask a question?</AccordionTrigger>
                <AccordionContent>
                  Type your question about the YakiHonne API, its features, or Nostr integration into the text area and click "Ask". The AI will provide a detailed answer and a code snippet if relevant. You can try one of the example prompts to see it in action.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How do I build a Smart Widget?</AccordionTrigger>
                <AccordionContent>
                  Describe the widget you want to build in the text area (e.g., "Build a widget that generates a UUID"). The AI will generate an explanation and the complete HTML code for the widget. You can then use the "Publish Widget" button to make it available on Nostr via your browser extension (like Alby).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
      </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>
            Built by{' '}
            <Link
              href="https://x.com/@malkrite"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              @malkrite
            </Link>
          </p>
      </footer>
    </main>
  );
}
