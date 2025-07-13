'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating the source code
 * and metadata for a YakiHonne Smart Widget based on a user's prompt.
 *
 * - generateWidgetCode - A function that generates widget code from a prompt.
 * - WidgetCode - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateWidgetCodeInputSchema = z.object({
  prompt: z.string().describe('The user prompt describing the widget to build.'),
});

const WidgetCodeSchema = z.object({
  explanation: z.string().describe("A brief, friendly explanation of what the generated widget does and how to use it."),
  widgetName: z.string().describe("A short, descriptive name for the widget (e.g., 'Nostr Zapper')."),
  htmlCode: z.string().describe("The complete, self-contained HTML source code for the widget. This MUST include all necessary HTML, CSS, and JavaScript within a single file. JavaScript should be in a <script> tag and CSS in a <style> tag."),
  widgetKind: z.number().describe("The Nostr kind for the widget, typically 31337 for an Action Widget."),
});
export type WidgetCode = z.infer<typeof WidgetCodeSchema>;

export async function generateWidgetCode(input: { prompt: string }): Promise<WidgetCode> {
  return generateWidgetCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWidgetCodePrompt',
  input: { schema: GenerateWidgetCodeInputSchema },
  output: { schema: WidgetCodeSchema },
  prompt: `You are an expert developer specializing in creating YakiHonne Smart Widgets. Your task is to generate the complete, self-contained source code for a widget based on the user's request.

IMPORTANT RULES:
1.  The entire widget must be a single HTML file. All CSS must be inside a <style> tag and all JavaScript must be inside a <script> tag in the HTML body.
2.  The JavaScript code MUST use the 'smart-widget-handler' library to communicate with the host YakiHonne client. The library is automatically available in the widget's context.
3.  The widget should be simple, clean, and functional.
4.  For any action that requires user input (like a pubkey or lightning address), use an HTML <input> element.
5.  Provide a user-friendly explanation of what the widget does.
6.  The default widget kind should be 31337 (Action Widget) unless the request clearly implies a different type.

EXAMPLE:
User prompt: "I want to build a smart widget to zap a nostr user"

Your generated output (in JSON format) should be:
{
  "explanation": "This widget lets you send a zap to any Nostr user! Just enter their pubkey, specify the amount in sats, and click 'Generate Zap Invoice'. The host client will then handle the payment.",
  "widgetName": "Nostr User Zapper",
  "widgetKind": 31337,
  "htmlCode": "<html><head><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;gap:10px;margin:0;background-color:#f0f2f5;}input{padding:8px;border-radius:4px;border:1px solid #ccc;}button{padding:10px 15px;border-radius:4px;border:none;background-color:#6c47ff;color:white;cursor:pointer;}</style></head><body><h3>Zap a Nostr User</h3><input id='pubkey' placeholder='Enter user pubkey (hex)'/><input id='amount' type='number' placeholder='Amount (sats)'/><button onclick='generateZap()'>Generate Zap Invoice</button><script>let hostOrigin = null; SWhandler.client.ready(); const listener = SWhandler.client.listen(e => { if (e.kind === 'user-metadata' && e.data?.host_origin) { hostOrigin = e.data.host_origin; }}); async function generateZap() { const pubkey = document.getElementById('pubkey').value; const amount = document.getElementById('amount').value; if (!pubkey || !amount) { alert('Please enter a pubkey and amount.'); return; } const lnurl = 'https://api.getalby.com/lnurlp/' + pubkey; try { const res = await fetch(lnurl); const data = await res.json(); const invoice = await fetch(\`\${data.callback}?amount=\${amount * 1000}\`); const {pr} = await invoice.json(); if (hostOrigin) { SWhandler.client.sendContext('lightning:' + pr, hostOrigin); } else { alert('Could not get host origin.'); } } catch (e) { alert('Failed to get invoice: ' + e.message); } }</script></body></html>"
}
---
Now, process the following user request.

User prompt: {{{prompt}}}
`,
});

const generateWidgetCodeFlow = ai.defineFlow(
  {
    name: 'generateWidgetCodeFlow',
    inputSchema: GenerateWidgetCodeInputSchema,
    outputSchema: WidgetCodeSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate widget code.");
    }
    return output;
  }
);
