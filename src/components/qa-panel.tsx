"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Quote, Send, Sparkles } from "lucide-react";

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
import type { AnswerQuestionFromDocsOutput } from "@/ai/flows/answer-question-from-docs";

const FormSchema = z.object({
  question: z.string().min(10, {
    message: "Question must be at least 10 characters.",
  }),
});

export function QAPanel() {
  const [response, setResponse] = React.useState<AnswerQuestionFromDocsOutput | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
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
      }
    });
  }

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
                        placeholder="e.g., How do I authenticate my API requests?"
                        className="resize-none border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending} size="lg">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      Ask Question
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
              Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed whitespace-pre-wrap">{response.answer}</p>
          </CardContent>
          {response.citation && (
             <CardFooter>
                <div className="w-full">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Citation</p>
                    <blockquote className="border-l-2 border-border pl-4 italic text-muted-foreground">
                        <Quote className="h-4 w-4 inline-block mr-2 -mt-1" />
                        {response.citation}
                    </blockquote>
                </div>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
