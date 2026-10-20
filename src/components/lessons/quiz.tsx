"use client";

import { Check, X } from "lucide-react";
import { useId, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import type { QuizQuestion } from "@/types/content";

import { RichText } from "./rich-text";

function Question({ q, index, onAnswered }: { q: QuizQuestion; index: number; onAnswered: (correct: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const name = useId();
  const correct = checked && choice === q.answer;

  return (
    <li className="rounded-panel border border-line bg-surface p-5">
      <fieldset disabled={checked}>
        <legend className="font-semibold text-fg">
          <span className="mr-2 text-fg-faint">{index + 1}.</span>
          <RichText text={q.question} />
        </legend>
        <div className="mt-3 space-y-2">
          {q.options.map((option, i) => {
            const isAnswer = i === q.answer;
            const isChoice = i === choice;
            return (
              <label
                key={option}
                className={cx(
                  "flex cursor-pointer items-start gap-3 rounded-control border px-3 py-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary",
                  checked && isAnswer
                    ? "border-success"
                    : checked && isChoice
                      ? "border-danger"
                      : isChoice
                        ? "border-primary bg-mist"
                        : "border-line hover:bg-sunken",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  checked={isChoice}
                  onChange={() => setChoice(i)}
                  className="mt-1 size-4 shrink-0 accent-[var(--color-primary)]"
                />
                <span className="flex-1 text-fg-muted">
                  <RichText text={option} />
                </span>
                {checked && isAnswer ? (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-success">
                    <Check aria-hidden className="size-4" /> Correct answer
                  </span>
                ) : checked && isChoice ? (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-danger">
                    <X aria-hidden className="size-4" /> Your answer
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>
      {!checked ? (
        <button
          type="button"
          disabled={choice === null}
          onClick={() => {
            setChecked(true);
            onAnswered(choice === q.answer);
          }}
          className={buttonStyles("secondary", "mt-4 px-4 py-2")}
        >
          Check answer
        </button>
      ) : (
        <div role="status" className="mt-4 rounded-control bg-sunken p-3">
          <p className={cx("font-semibold", correct ? "text-success" : "text-danger")}>{correct ? "Correct." : "Not quite."}</p>
          <p className="mt-1 text-fg-muted">
            <RichText text={q.explanation} />
          </p>
        </div>
      )}
    </li>
  );
}

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [results, setResults] = useState<boolean[]>([]);
  const done = results.length;

  return (
    <div>
      <ol className="space-y-4">
        {questions.map((q, i) => (
          <Question key={q.question} q={q} index={i} onAnswered={(ok) => setResults((r) => [...r, ok])} />
        ))}
      </ol>
      <p className="mt-4 text-sm text-fg-muted" aria-live="polite">
        {done === 0
          ? `${questions.length} questions. Answers are checked in your browser and not saved.`
          : `${results.filter(Boolean).length} of ${done} answered correctly so far.`}
      </p>
    </div>
  );
}
