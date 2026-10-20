import { ChevronDown } from "lucide-react";

import type { PaperSection } from "@/types/content";

/** Sample paper outline as native disclosure widgets (keyboard accessible, no JS). */
export function PaperOutline({ sections }: { sections: PaperSection[] }) {
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-panel border border-line">
      {sections.map((section, i) => (
        <li key={section.id}>
          <details className="group" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 hover:bg-board-raised sm:px-6 [&::-webkit-details-marker]:hidden">
              <span className="w-6 shrink-0 text-sm tabular-nums text-chalk-faint">{i + 1}</span>
              <span className="flex-1">
                <span className="block font-bold">{section.title}</span>
                <span className="block text-sm text-chalk-muted">{section.purpose}</span>
              </span>
              <ChevronDown aria-hidden className="size-5 shrink-0 text-chalk-muted transition-transform duration-150 group-open:rotate-180" />
            </summary>
            <div className="grid gap-6 border-t border-line bg-board-raised px-5 py-5 sm:px-6 md:grid-cols-2 md:pl-16">
              <div>
                <p className="text-sm font-bold">Include</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-chalk-muted marker:text-line-strong">
                  {section.include.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm font-bold">Avoid</p>
                <p className="mt-1 text-chalk-muted">{section.avoid}</p>
              </div>
              <div>
                <p className="text-sm font-bold">Shape of the text</p>
                <p className="mt-2 rounded-control border border-dashed border-line-strong bg-board-deep p-4 font-mono text-[0.9rem] leading-relaxed text-chalk-muted">
                  {section.example}
                </p>
              </div>
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
