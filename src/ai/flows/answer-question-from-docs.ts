'use server';
/**
 * @fileOverview Answers questions based on provided documentation.
 *
 * - answerQuestionFromDocs - A function that answers a question from documentation.
 * - AnswerQuestionFromDocsInput - The input type for the answerQuestionFromDocs function.
 * - AnswerQuestionFromDocsOutput - The return type for the answerQuestionFromDocs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionFromDocsInputSchema = z.object({
  question: z.string().describe('The question to answer from the documentation.'),
  documentation: z.string().describe('The documentation to use to answer the question.'),
});
export type AnswerQuestionFromDocsInput = z.infer<typeof AnswerQuestionFromDocsInputSchema>;

const AnswerQuestionFromDocsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, based on the documentation.'),
  codeSnippet: z.string().nullable().describe('An optional code snippet if the question asks for an example.'),
  citation: z.string().optional().describe('The relevant documentation cited, if any.'),
});
export type AnswerQuestionFromDocsOutput = z.infer<typeof AnswerQuestionFromDocsOutputSchema>;

export async function answerQuestionFromDocs(input: AnswerQuestionFromDocsInput): Promise<AnswerQuestionFromDocsOutput> {
  return answerQuestionFromDocsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionFromDocsPrompt',
  input: {schema: AnswerQuestionFromDocsInputSchema},
  output: {schema: AnswerQuestionFromDocsOutputSchema},
  prompt: `You are an expert software developer and AI assistant specializing in the YakiHonne API. Your task is to provide a comprehensive response to the user's query based on the provided documentation.

  - If the user asks a factual question (e.g., "What is a Tool Widget?"), provide a clear answer in the 'answer' field and a relevant 'citation' from the documentation. 'codeSnippet' should be null.
  - If the user asks for a simple code example (e.g., "Show me how to send a Nostr event"), provide an explanation in the 'answer' field and a complete code snippet in the 'codeSnippet' field.
  - If the documentation does not contain the answer, respond that the answer is not in the documentation.

  User Query: {{{question}}}

  Full API Documentation for context:
  {{{documentation}}}
  `,
});

const answerQuestionFromDocsFlow = ai.defineFlow(
  {
    name: 'answerQuestionFromDocsFlow',
    inputSchema: AnswerQuestionFromDocsInputSchema,
    outputSchema: AnswerQuestionFromDocsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
