'use server';

/**
 * @fileOverview This file defines the main Genkit flow that acts as a router.
 * It determines if a user wants to ask a question or build a widget and
 * delegates the request to the appropriate specialized flow.
 *
 * - generateDeveloperResponse - The main function that routes user requests.
 * - DeveloperResponseInput - The input type for the function.
 * - DeveloperResponseOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateWidgetCode, type WidgetCode } from './generate-widget-code';
import { answerQuestionFromDocs } from './answer-question-from-docs';


const DeveloperResponseInputSchema = z.object({
  query: z.string().describe('The user query, which can be a question or a request to build something.'),
  documentation: z.string().describe('The full API documentation for context.'),
});
export type DeveloperResponseInput = z.infer<typeof DeveloperResponseInputSchema>;

const DeveloperResponseOutputSchema = z.object({
  answer: z.string().describe("The textual answer or explanation for the user's query."),
  codeSnippet: z.string().nullable().describe('An optional code snippet if the user asked for an example or how to build something.'),
  citation: z.string().nullable().describe('An optional citation from the documentation if the user asked a factual question.'),
  widgetCode: z.object({
    explanation: z.string(),
    widgetName: z.string(),
    htmlCode: z.string(),
    widgetKind: z.number(),
  }).nullable().describe('The generated code and metadata for a smart widget, if requested.'),
});
export type DeveloperResponseOutput = z.infer<typeof DeveloperResponseOutputSchema>;

export async function generateDeveloperResponse(
  input: DeveloperResponseInput
): Promise<DeveloperResponseOutput> {
  return generateDeveloperResponseFlow(input);
}

const decisionPrompt = ai.definePrompt({
    name: 'widgetOrQuestionDecision',
    input: { schema: z.object({ query: z.string() }) },
    output: { schema: z.object({ isWidgetRequest: z.boolean().describe('Set to true if the user wants to build, create, or make a widget. Otherwise, set to false.') }) },
    prompt: `Analyze the user's query and determine if they are asking to build, create, or make a widget.

    User Query: {{{query}}}`,
});


const generateDeveloperResponseFlow = ai.defineFlow(
  {
    name: 'generateDeveloperResponseFlow',
    inputSchema: DeveloperResponseInputSchema,
    outputSchema: DeveloperResponseOutputSchema,
  },
  async (input) => {
    // First, ask a simple, targeted model to decide if it's a widget request.
    const decision = await decisionPrompt({ query: input.query });
    const isWidgetRequest = decision.output?.isWidgetRequest ?? false;

    if (isWidgetRequest) {
      // User wants to build a widget. Delegate to the widget generation flow.
      const widget = await generateWidgetCode({ prompt: input.query });
      return {
        answer: widget.explanation,
        codeSnippet: widget.htmlCode, // Also put HTML in snippet for display
        citation: null,
        widgetCode: widget,
      };
    } else {
      // It's a question. Delegate to the Q&A flow.
      const qaResult = await answerQuestionFromDocs({
        question: input.query,
        documentation: input.documentation,
      });
      return {
        ...qaResult,
        widgetCode: null, // Ensure widgetCode is null for non-widget responses
      };
    }
  }
);
