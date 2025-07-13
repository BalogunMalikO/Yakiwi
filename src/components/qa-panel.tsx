
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Quote, Send, Sparkles, UploadCloud } from "lucide-react";
import { SimplePool } from "nostr-tools";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { askQuestionAction } from "@/app/actions";
import type { DeveloperResponseOutput } from "@/ai/flows/generate-example-code";
import { NostrIcon } from "@/components/icons/nostr-icon";

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: {
        kind: number;
        created_at: number;
        tags: string[][];
        content: string;
      }): Promise<{
        id: string;
        sig: string;
        kind: number;
        created_at: number;
        tags: string[][];
        content: string;
        pubkey: string;
      }>;
    };
  }
}

const FormSchema = z.object({
  question: z.string().min(10, {
    message: "Question must be at least 10 characters.",
  }),
});

interface QAPanelProps {
  initialQuestion?: string;
  onApiResponse?: (response: DeveloperResponseOutput) => void;
}

export function QAPanel({ initialQuestion, onApiResponse }: QAPanelProps) {
  const [response, setResponse] = React.useState<DeveloperResponseOutput | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [nostrPending, setNostrPending] = React.useState(false);
  const [publishPending, setPublishPending] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: initialQuestion || "",
    },
  });

  React.useEffect(() => {
    if (initialQuestion) {
      form.setValue("question", initialQuestion);
      // Automatically submit the form if there's an initial question
      onSubmit({ question: initialQuestion });
    }
  }, [initialQuestion]);
  
  const handleShareOnNostr = async () => {
    if (!response) return;
    if (!window.nostr) {
      toast({
        variant: "destructive",
        title: "Nostr extension not found",
        description: "Please install a Nostr browser extension like Alby or nos2x.",
      });
      return;
    }

    setNostrPending(true);

    try {
      const relays = ["wss://relay.damus.io", "wss://relay.primal.net", "wss://nos.lol"];
      
      let content = `Q: ${form.getValues("question")}\n\nA: ${response.answer}`;
      if (response.codeSnippet && !response.widgetCode) { // Only add if not a widget
        content += `\n\n\`\`\`\n${response.codeSnippet}\n\`\`\``;
      }
      if (response.citation) {
        content += `\n\nCitation: ${response.citation}`;
      }
      
      const eventTemplate = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: content,
      };

      const signedEvent = await window.nostr.signEvent(eventTemplate);

      const pool = new SimplePool();
      let pubs = pool.publish(relays, signedEvent);

      await Promise.any(pubs.map(p => new Promise(r => p.on('ok', r))));

      pool.close(relays);

      toast({
        title: "Successfully shared on Nostr!",
        description: "Your Q&A has been published.",
      });
    } catch (e: any) {
      console.error("Nostr sharing failed", e);
      let errorMessage = "An unknown error occurred.";
      if (e instanceof AggregateError) {
        errorMessage = "Failed to publish to any relay.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      toast({
        variant: "destructive",
        title: "Failed to share on Nostr",
        description: errorMessage,
      });
    } finally {
      setNostrPending(false);
    }
  };

  const handlePublishWidget = async () => {
    if (!response?.widgetCode) return;
    if (!window.nostr) {
      toast({
        variant: "destructive",
        title: "Nostr extension not found",
        description: "Please install a Nostr browser extension like Alby or nos2x.",
      });
      return;
    }

    setPublishPending(true);
    const { widgetName, htmlCode, widgetKind } = response.widgetCode;

    try {
      const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(htmlCode)}`;
      const relays = ["wss://relay.damus.io", "wss://relay.primal.net", "wss://nos.lol"];
      
      const eventTemplate = {
        kind: widgetKind,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["d", widgetName],
          ["url", dataUri],
          ["image", "https://yakihonne.com/favicon.ico"] // Generic icon for now
        ],
        content: `Widget: ${widgetName}`,
      };

      const signedEvent = await window.nostr.signEvent(eventTemplate);

      const pool = new SimplePool();
      const pubs = pool.publish(relays, signedEvent);
      await Promise.any(pubs.map(p => new Promise(r => p.on('ok', r))));
      pool.close(relays);

      toast({
        title: "Widget Published!",
        description: `${widgetName} is now available on Nostr.`,
      });

    } catch (e: any) {
       console.error("Widget publishing failed", e);
      toast({
        variant: "destructive",
        title: "Failed to publish widget",
        description: e.message || "An unknown error occurred.",
      });
    } finally {
      setPublishPending(false);
    }
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setResponse(null);
    startTransition(async () => {
      const result = await askQuestionAction(data.question);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: result.error,
        });
        setResponse(null);
      } else {
        setResponse(result);
        onApiResponse?.(result);
      }
    });
  }
  
  const handleExampleClick = (question: string) => {
    form.setValue("question", question);
    form.handleSubmit(onSubmit)();
  };

  const examplePrompts = [
    "How do I build a smart widget that tells jokes?",
    "What's the difference between an Action and a Tool mini app?",
    "Build a widget that generates a UUID",
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Ask a question or describe a widget to build..."
                        className="resize-none border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                   <p className="text-sm font-medium text-muted-foreground">Or try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleExampleClick(prompt)}
                        className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                        disabled={isPending}
                      >
                       {prompt}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={isPending} size="lg" className="self-end ml-auto">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      Ask
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isPending && (
         <Card className="shadow-lg">
           <CardHeader>
              <Skeleton className="h-6 w-1/3" />
           </CardHeader>
           <CardContent className="space-y-4">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-4/5" />
           </CardContent>
           <CardFooter>
            <Skeleton className="h-4 w-1/2" />
           </CardFooter>
         </Card>
      )}

      {response && !isPending && (
        <Card className="animate-in fade-in shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Sparkles className="h-5 w-5 text-accent" />
              {response.widgetCode ? "Generated Widget" : "Answer"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed whitespace-pre-wrap">{response.answer}</p>
            {response.codeSnippet && (
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-2">
                  {response.widgetCode ? "Widget Code" : "Example Code"}
                </h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-code whitespace-pre-wrap leading-relaxed">
                  <code>{response.codeSnippet}</code>
                </pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full flex flex-col items-start gap-4">
              {response.citation && (
                <div className="w-full">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Citation</p>
                  <blockquote className="border-l-2 border-border pl-4 italic text-muted-foreground">
                    <Quote className="h-4 w-4 inline-block mr-2 -mt-1" />
                    {response.citation}
                  </blockquote>
                </div>
              )}
              <div className="flex w-full justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareOnNostr}
                  disabled={nostrPending || publishPending}
                >
                  {nostrPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <NostrIcon className="h-4 w-4 mr-2" />
                      Share on Nostr
                    </>
                  )}
                </Button>
                {response.widgetCode && (
                   <Button
                    size="sm"
                    onClick={handlePublishWidget}
                    disabled={publishPending || nostrPending}
                  >
                    {publishPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Publish Widget
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
