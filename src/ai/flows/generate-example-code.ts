'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a comprehensive developer response,
 * which can include answers to questions, code examples, and citations from documentation.
 *
 * - generateDeveloperResponse - A function that can answer questions and generate code.
 * - DeveloperResponseInput - The input type for the function.
 * - DeveloperResponseOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeveloperResponseInputSchema = z.object({
  query: z.string().describe('The user query, which can be a question or a request to build something.'),
  documentation: z.string().describe('The full API documentation for context.'),
});
export type DeveloperResponseInput = z.infer<typeof DeveloperResponseInputSchema>;

const DeveloperResponseOutputSchema = z.object({
  answer: z.string().describe("The textual answer or explanation for the user's query."),
  codeSnippet: z.string().nullable().describe('An optional code snippet if the user asked for an example or how to build something.'),
  citation: z.string().nullable().describe('An optional citation from the documentation if the user asked a factual question.'),
});
export type DeveloperResponseOutput = z.infer<typeof DeveloperResponseOutputSchema>;

export async function generateDeveloperResponse(
  input: DeveloperResponseInput
): Promise<DeveloperResponseOutput> {
  return generateDeveloperResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDeveloperResponsePrompt',
  input: {schema: DeveloperResponseInputSchema},
  output: {schema: DeveloperResponseOutputSchema},
  prompt: `You are an expert software developer and AI assistant specializing in the YakiHonne API and its integration with technologies like Nostr.

Your task is to provide a comprehensive response to the user's query. You have access to the full YakiHonne API documentation.

1.  **If the user asks a factual question** about the API (e.g., "How do I authenticate?"), provide a clear and concise answer based on the documentation in the 'answer' field. If possible, cite the specific section of the documentation in the 'citation' field. Set the 'codeSnippet' field to null.

2.  **If the user asks for a code example or how to build something** (e.g., "Show me how to create a widget," or "I want to build a music player on Nostr using YakiHonne"), provide a step-by-step explanation in the 'answer' field and a relevant, complete code snippet in the 'codeSnippet' field to help them get started. Explain how YakiHonne APIs can be used for the task. Set the 'citation' field to null.

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
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
