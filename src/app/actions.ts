"use server";

import { generateDeveloperResponse } from "@/ai/flows/generate-example-code";
import type { DeveloperResponseOutput } from "@/ai/flows/generate-example-code";
import fs from 'fs/promises';
import path from 'path';

// Function to fetch the documentation. It's cached for performance.
const getDocs = async () => {
    const docPath = path.join(process.cwd(), 'src/data', 'yakihonne-docs.md');
    try {
        const data = await fs.readFile(docPath, 'utf-8');
        return data;
    } catch (error) {
        console.error('Error reading documentation file:', error);
        throw new Error('Failed to fetch documentation.');
    }
};


export async function askQuestionAction(question: string): Promise<DeveloperResponseOutput & { error?: string }> {
  try {
    if (!question) {
      return { error: "Question cannot be empty.", answer: "", codeSnippet: null, citation: null };
    }
    
    const YAKIHONNE_API_DOCS = await getDocs();

    const result = await generateDeveloperResponse({
      query: question,
      documentation: YAKIHONNE_API_DOCS,
    });
    
    return result;
  } catch (e: any) {
    console.error(e);
    // This is a common error from Genkit when the model refuses to answer.
    if (e.message?.includes('The model refused to respond to the prompt')) {
        return {
            answer: "I am unable to provide a response for this request. Please try rephrasing your query or ask about a different topic related to the YakiHonne API.",
            codeSnippet: null,
            citation: null,
        };
    }
    return {
      error: e.message || "An unexpected error occurred. Please try again.",
      answer: "",
      codeSnippet: null,
      citation: null,
    };
  }
}
