'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a comprehensive developer response,
 * which can include answers to questions, code examples, and citations from documentation.
 * It also acts as a router to delegate widget generation requests.
 *
 * - generateDeveloperResponse - A function that can answer questions and generate code.
 * - DeveloperResponseInput - The input type for the function.
 * - DeveloperResponseOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateWidgetCode, type WidgetCode } from './generate-widget-code';


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

const shouldGenerateWidgetTool = ai.defineTool(
  {
    name: 'shouldGenerateWidget',
    description: 'Use this tool to determine if the user wants to build or create a smart widget.',
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.boolean(),
  },
  async () => {
    // This is a passthrough tool. The model's decision to use it is what matters.
    // The actual widget generation will happen in the main flow.
    return true;
  }
);


const prompt = ai.definePrompt({
  name: 'generateDeveloperResponsePrompt',
  input: {schema: DeveloperResponseInputSchema},
  output: {schema: DeveloperResponseOutputSchema},
  tools: [shouldGenerateWidgetTool],
  prompt: `You are an expert software developer and AI assistant specializing in the YakiHonne API and its integration with technologies like Nostr.

Your task is to provide a comprehensive response to the user's query. You have access to the full YakiHonne API documentation.

Your primary decision is whether the user is asking a question OR asking to build/create a smart widget.

1.  **If the user asks to build, create, or make a smart widget** (e.g., "build a widget that zaps users"), call the 'shouldGenerateWidget' tool. DO NOT answer the question directly. The main flow will handle the widget generation.
2.  **If the user asks a factual question** about the API (e.g., "How do I authenticate?"), provide a clear and concise answer based on the documentation in the 'answer' field. If possible, cite the specific section of the documentation in the 'citation' field. Set the 'codeSnippet' and 'widgetCode' fields to null.
3.  **If the user asks for a simple code example or how to do something that is NOT a full widget** (e.g., "Show me how to send a Nostr event"), provide a step-by-step explanation in the 'answer' field and a relevant, complete code snippet in the 'codeSnippet' field. Set the 'citation' and 'widgetCode' fields to null.

Always provide a helpful and encouraging response.

User Query: {{{query}}}

Full API Documentation for context:
{{{documentation}}}`,
});

const generateDeveloperResponseFlow = ai.defineFlow(
  {
    name: 'generateDeveloperResponseFlow',
    inputSchema: DeveloperResponseInputSchema,
    outputSchema: DeveloperResponseOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    
    const choice = llmResponse.choices[0];
    const toolRequest = choice.toolRequest('shouldGenerateWidget');

    if (toolRequest) {
      // User wants to build a widget. Delegate to the widget generation flow.
      const widget = await generateWidgetCode({ prompt: input.query });
      return {
        answer: widget.explanation,
        codeSnippet: widget.htmlCode, // Also put HTML in snippet for display
        citation: null,
        widgetCode: widget,
      };
    } else {
      // This is a standard Q&A or simple code example request.
      const output = choice.output();
      if (!output) {
        throw new Error("Flow failed to produce output.");
      }
      return {
        ...output,
        widgetCode: null, // Ensure widgetCode is null for non-widget responses
      };
    }
  }
);
