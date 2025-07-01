import * as React from "react";

export function NostrIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
    >
      <title>Nostr</title>
      <path d="M18.693 3.324c-3.324 3.324-6.648 6.648-9.972 9.972L.36 21.684A11.95 11.95 0 0 1 0 12C0 5.373 5.373 0 12 0a11.95 11.95 0 0 1 6.693 3.324zm4.946 18.36c.54-.312 1.08-.624 1.62-.936l-18.432-19.056L.36 21.684a11.95 11.95 0 0 0 1.62.936l18.36-19.056c.504.312.972.588 1.512.9zM21.684.36A11.95 11.95 0 0 1 12 24a11.95 11.95 0 0 1-9.684-3.324c3.324-3.324 6.648-6.648 9.972-9.972l9.396-9.396z" />
    </svg>
  );
}
