import { AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { Fragment } from "react";

import { cx } from "@/lib/cx";
import type { Block, RichText as RichTextValue } from "@/types/content";

/** Renders `code` and **bold** inside a plain string. Nothing else is interpreted. */
export function RichText({ text }: { text: RichTextValue }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return (
            <code key={i} className="code-inline">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 3) {
          return (
            <strong key={i} className="font-semibold text-fg">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

const calloutStyle = {
  note: { Icon: Info, className: "border-line bg-mist", iconClass: "text-link" },
  warning: { Icon: AlertTriangle, className: "border-highlight bg-sage", iconClass: "text-highlight-text" },
  honesty: { Icon: ShieldCheck, className: "border-primary bg-surface", iconClass: "text-link" },
} as const;

export function Blocks({ blocks, className }: { blocks: Block[]; className?: string }) {
  return (
    <div className={cx("space-y-4", className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="max-w-prose text-fg-muted">
                <RichText text={block.text} />
              </p>
            );
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List
                key={i}
                className={cx("max-w-prose space-y-1.5 pl-5 text-fg-muted marker:text-fg-faint", block.ordered ? "list-decimal" : "list-disc")}
              >
                {block.items.map((item) => (
                  <li key={item}>
                    <RichText text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-panel border border-line bg-surface" tabIndex={0} role="region" aria-label={block.caption}>
                <table className="w-full min-w-[32rem] border-collapse text-left text-[0.95rem]">
                  <caption className="px-4 pt-3 text-left text-sm font-semibold text-fg">{block.caption}</caption>
                  <thead>
                    <tr className="border-b border-line">
                      {block.head.map((h) => (
                        <th key={h} scope="col" className="px-4 py-2.5 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-t border-line first:border-t-0">
                        {row.map((cell, c) => (
                          <td key={c} className="px-4 py-2 text-fg-muted">
                            <RichText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "callout": {
            const { Icon, className: tone, iconClass } = calloutStyle[block.tone];
            return (
              <aside key={i} className={cx("flex gap-3 rounded-panel border p-4", tone)}>
                <Icon aria-hidden className={cx("mt-0.5 size-5 shrink-0", iconClass)} />
                <div>
                  <p className="font-semibold text-fg">{block.title}</p>
                  <p className="mt-1 text-fg-muted">
                    <RichText text={block.text} />
                  </p>
                </div>
              </aside>
            );
          }
          case "equation":
            return (
              <div key={i} className="rounded-control border-l-2 border-primary bg-surface px-4 py-3">
                <p className="math text-lg text-fg">{block.expression}</p>
                <p className="mt-1 text-sm text-fg-muted">
                  <RichText text={block.meaning} />
                </p>
              </div>
            );
        }
      })}
    </div>
  );
}
