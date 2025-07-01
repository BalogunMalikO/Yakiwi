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
  prompt: `You are an AI assistant that answers questions based on provided documentation.

  Question: {{{question}}}

  Documentation: {{{documentation}}}

  Answer the question using only the information in the documentation. Cite the specific section of the documentation used to answer the question, if possible.
  If the documentation does not contain the answer to the question, respond that the answer is not in the documentation.
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
