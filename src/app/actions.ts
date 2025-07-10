"use server";

import { generateDeveloperResponse } from "@/ai/flows/generate-example-code";
import type { DeveloperResponseOutput } from "@/ai/flows/generate-example-code";
import fs from "fs";
import path from "path";

// Read the documentation from the dedicated markdown file.
const YAKIHONNE_API_DOCS = fs.readFileSync(
  path.join(process.cwd(), "src/data/yakihonne-docs.md"),
  "utf-8"
);

export async function askQuestionAction(question: string): Promise<DeveloperResponseOutput & { error?: string }> {
  try {
    if (!question) {
      return { error: "Question cannot be empty.", answer: "", codeSnippet: null, citation: null };
    }

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
