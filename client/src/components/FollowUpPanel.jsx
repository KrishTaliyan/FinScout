import { useState } from "react";
import { CircleAlert, Loader2, MessageCircleQuestion, Send } from "lucide-react";
import useFollowUp from "../hooks/useFollowUp.js";

const SUGGESTED_QUESTIONS = [
  "What's the biggest risk here?",
  "How does it make money?",
  "Why this score?",
  "Who are the main competitors?"
];

export default function FollowUpPanel({ company, context }) {
  const [input, setInput] = useState("");
  const { questions, ask } = useFollowUp(company, context);

  function handleSubmit(event) {
    event.preventDefault();
    if (!input.trim()) return;
    ask(input);
    setInput("");
  }

  return (
    <section className="soft-panel no-print p-5 sm:p-6">
      <div className="flex items-center gap-2 border-b border-hairline pb-3">
        <MessageCircleQuestion className="text-brass-500" size={18} aria-hidden="true" />
        <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brass-600 dark:text-brass-500">
          Ask a follow-up
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={`Ask anything about ${company}'s research...`}
          className="w-full rounded-sm border border-hairline bg-paper px-4 py-3 font-sans text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-invest-600 focus:ring-2 focus:ring-invest-600/20"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-ink px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-paper transition hover:bg-invest-700 disabled:cursor-not-allowed disabled:bg-muted"
        >
          <Send size={15} aria-hidden="true" />
        </button>
      </form>

      {questions.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => ask(question)}
              className="rounded-sm border border-hairline bg-paper px-3 py-1.5 font-mono text-xs text-ink transition hover:border-invest-600 hover:text-invest-700"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {questions
          .slice()
          .reverse()
          .map((item) => (
            <div key={item.id} className="rounded-sm border border-hairline bg-paper p-4">
              <p className="font-mono text-xs font-semibold text-ink">{item.question}</p>

              {item.isLoading && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="spinner" size={14} aria-hidden="true" />
                  Thinking...
                </div>
              )}

              {item.error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-pass-700">
                  <CircleAlert size={14} aria-hidden="true" />
                  {item.error}
                </div>
              )}

              {!item.isLoading && !item.error && item.answerPoints?.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {item.answerPoints.map((point, index) => (
                    <li key={index} className="flex gap-2 text-sm leading-6 text-ink/85">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-invest-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
      </div>
    </section>
  );
}