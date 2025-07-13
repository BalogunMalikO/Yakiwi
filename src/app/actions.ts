"use server";

import { generateDeveloperResponse } from "@/ai/flows/generate-example-code";
import type { DeveloperResponseOutput } from "@/ai/flows/generate-example-code";
import { YAKIHONNE_API_DOCS } from "@/data/docs";

export async function askQuestionAction(question: string): Promise<DeveloperResponseOutput & { error?: string }> {
  try {
    if (!question) {
      return { error: "Question cannot be empty.", answer: "", codeSnippet: null, citation: null, widgetCode: null };
    }

    const result = await generateDeveloperResponse({
      query: question,
      documentation: YAKIHONNE_API_DOCS,
    });
    
    return result;
  } catch (e: any) {
    console.error(e);
    // This is a common error from Genkit when the model refuses to answer or returns no choices.
    if (e.message?.includes('The model refused to respond') || e.message?.includes('did not return any choices')) {
        return {
            answer: "I am unable to provide a response for this request. This can sometimes happen due to safety filters or the complexity of the query. Please try rephrasing your request or ask about a different topic related to the YakiHonne API.",
            codeSnippet: null,
            citation: null,
            widgetCode: null,
        };
    }
    return {
      error: e.message || "An unexpected error occurred. Please try again.",
      answer: "",
      codeSnippet: null,
      citation: null,
      widgetCode: null,
    };
  }
}
