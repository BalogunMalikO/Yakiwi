'use server';

/**
 * @fileOverview Summarizes API documentation text provided by the user.
 *
 * - summarizeApiDocumentation - A function that summarizes the documentation.
 * - SummarizeApiDocumentationInput - The input type for the summarizeApiDocumentation function.
 * - SummarizeApiDocumentationOutput - The return type for the summarizeApiDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeApiDocumentationInputSchema = z.object({
  apiDocumentation: z.string().describe('The API documentation text to summarize.'),
});
export type SummarizeApiDocumentationInput = z.infer<typeof SummarizeApiDocumentationInputSchema>;

const SummarizeApiDocumentationOutputSchema = z.object({
  summary: z.string().describe('A summary of the API documentation.'),
});
export type SummarizeApiDocumentationOutput = z.infer<typeof SummarizeApiDocumentationOutputSchema>;

export async function summarizeApiDocumentation(
  input: SummarizeApiDocumentationInput
): Promise<SummarizeApiDocumentationOutput> {
  return summarizeApiDocumentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeApiDocumentationPrompt',
  input: {schema: SummarizeApiDocumentationInputSchema},
  output: {schema: SummarizeApiDocumentationOutputSchema},
  prompt: `You are an expert documentation summarizer.

  Summarize the following API documentation, highlighting the most important points:

  {{apiDocumentation}}`,
});

const summarizeApiDocumentationFlow = ai.defineFlow(
  {
    name: 'summarizeApiDocumentationFlow',
    inputSchema: SummarizeApiDocumentationInputSchema,
    outputSchema: SummarizeApiDocumentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
