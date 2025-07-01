'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating example code snippets for the Yakihonne API.
 *
 * The flow takes a scenario description as input and returns an example code snippet.
 * - generateExampleCode - A function that generates example code snippets.
 * - GenerateExampleCodeInput - The input type for the generateExampleCode function.
 * - GenerateExampleCodeOutput - The return type for the generateExampleCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExampleCodeInputSchema = z.object({
  scenario: z
    .string()
    .describe(
      'A description of the scenario for which to generate an example code snippet for the Yakihonne API.'
    ),
});
export type GenerateExampleCodeInput = z.infer<typeof GenerateExampleCodeInputSchema>;

const GenerateExampleCodeOutputSchema = z.object({
  codeSnippet: z.string().describe('The generated example code snippet.'),
});
export type GenerateExampleCodeOutput = z.infer<typeof GenerateExampleCodeOutputSchema>;

export async function generateExampleCode(
  input: GenerateExampleCodeInput
): Promise<GenerateExampleCodeOutput> {
  return generateExampleCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExampleCodePrompt',
  input: {schema: GenerateExampleCodeInputSchema},
  output: {schema: GenerateExampleCodeOutputSchema},
  prompt: `You are an expert software developer specializing in the Yakihonne API.

You will generate an example code snippet based on the following scenario. The code snippet should be complete and ready to run.

Scenario: {{{scenario}}}`,
});

const generateExampleCodeFlow = ai.defineFlow(
  {
    name: 'generateExampleCodeFlow',
    inputSchema: GenerateExampleCodeInputSchema,
    outputSchema: GenerateExampleCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
