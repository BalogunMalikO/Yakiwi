# YaKiwi - AI Assistant for YakiHonne

YaKiwi is an AI-powered Q&A application designed to help developers understand and use the YakiHonne API and related Nostr technologies. It's built with Next.js, Genkit for AI functionality, and ShadCN for the user interface.

## Current Features

- **AI-Powered Q&A:** Ask questions in natural language and get answers based on a built-in knowledge base. The AI can provide both textual explanations and code snippets.
- **Nostr Integration:**
    - **Share on Nostr:** Users can publish Q&A pairs directly to the Nostr network using a browser extension (e.g., Alby).
    - **Tool Mini App:** YaKiwi is configured as a Nostr Tool Mini App. It can be embedded within host clients like YakiHonne, receive questions, and send answers back to the host.
- **Extensible Knowledge Base:** The AI's knowledge is sourced from a dedicated markdown file (`src/data/yakihonne-docs.md`), making it easy to update and expand.

## Getting Started

To run the project locally:

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
This will start the Next.js application on `http://localhost:9002`.

## Potential Improvements

- **Scalable Knowledge Base (RAG):** The current approach sends the entire documentation file to the AI with each request. For larger datasets, implementing a Retrieval-Augmented Generation (RAG) system would be more efficient. This involves indexing the documentation into a vector database and retrieving only the most relevant chunks to answer a specific question.
- **Streaming Responses:** To improve perceived performance, the AI's answers could be streamed to the UI word-by-word, rather than waiting for the full response to be generated.
- **Conversation History:** Adding a feature to remember the context of the current conversation would allow for more natural follow-up questions.
- **Advanced UI/UX:** The user interface could be enhanced with features like syntax highlighting for code snippets and a dedicated "Copy" button.
