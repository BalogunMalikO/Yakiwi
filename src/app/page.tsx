import { QAPanel } from "@/components/qa-panel";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-2 text-4xl font-bold text-foreground sm:text-5xl font-headline">
            <Sparkles className="h-8 w-8 text-accent" />
            YaKiwi
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your friendly AI assistant for the Yakihonne API
          </p>
        </header>
        <QAPanel />
      </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Powered by GenAI</p>
      </footer>
    </main>
  );
}
