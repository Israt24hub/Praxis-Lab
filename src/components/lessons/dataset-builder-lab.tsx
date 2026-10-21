"use client";

import { AlertTriangle, CheckCircle2, CircleHelp, RotateCcw } from "lucide-react";
import { useId, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { newStudent, studentColumns, students, type ColumnInfo, type StudentKey } from "@/content/datasets/week8-students";
import { cx } from "@/lib/cx";

/*
 * Choose a role for each raw column and see the feature matrix X, the target y
 * and the row for a new student that result. The encoding is computed live.
 */

type Role = "feature" | "target" | "unused";

const initialRoles = Object.fromEntries(studentColumns.map((c) => [c.key, "feature"])) as Record<StudentKey, Role>;

interface EncodedColumn {
  name: string;
  source: StudentKey;
  value: (row: Partial<Record<StudentKey, string | number>>) => number | null;
}

function categoriesOf(key: StudentKey) {
  return [...new Set(students.map((s) => String(s[key])))].sort();
}

function encode(col: ColumnInfo, dropFirst: boolean): EncodedColumn[] {
  if (col.kind === "number") {
    return [
      {
        name: col.label.split(" ")[0],
        source: col.key,
        value: (row) => (row[col.key] === undefined ? null : Number(row[col.key])),
      },
    ];
  }
  // Categories and identifiers are one-hot encoded with the categories seen in the training data.
  const cats = categoriesOf(col.key);
  const kept = dropFirst ? cats.slice(1) : cats;
  return kept.map((cat) => ({
    name: `${col.label}_${cat}`,
    source: col.key,
    value: (row) => (row[col.key] === undefined ? null : row[col.key] === cat ? 1 : 0),
  }));
}

type Issue = { level: "problem" | "note"; text: string };

function review(roles: Record<StudentKey, Role>): Issue[] {
  const issues: Issue[] = [];
  const targets = studentColumns.filter((c) => roles[c.key] === "target");
  const features = studentColumns.filter((c) => roles[c.key] === "feature");
  if (targets.length === 0) issues.push({ level: "problem", text: "No target yet. Choose the column you want to predict." });
  for (const c of features) {
    if (c.key === "studentId") issues.push({ level: "problem", text: `student_id is a feature. ${c.note}` });
    if (c.key === "finalExam") issues.push({ level: "problem", text: `final_exam is a feature. ${c.note}` });
    if (c.key === "passed") issues.push({ level: "problem", text: `passed is a feature. ${c.note}` });
  }
  const t = targets[0];
  if (t && t.key !== "passed") {
    issues.push({
      level: "note",
      text:
        t.kind === "number"
          ? `You are predicting ${t.label}, a number — that is a regression problem. The course question was whether a student passes.`
          : `You are predicting ${t.label}. That is a valid task, but not the question we started with: will this student pass?`,
    });
  }
  if (features.length === 0) issues.push({ level: "problem", text: "No features. A model needs at least one input column." });
  return issues;
}

export function DatasetBuilderLab() {
  const [roles, setRoles] = useState<Record<StudentKey, Role>>(initialRoles);
  const [dropFirst, setDropFirst] = useState(false);
  const dropId = useId();

  function setRole(key: StudentKey, role: Role) {
    setRoles((prev) => {
      const next = { ...prev, [key]: role };
      // Only one target at a time.
      if (role === "target") for (const c of studentColumns) if (c.key !== key && next[c.key] === "target") next[c.key] = "unused";
      return next;
    });
  }

  const featureCols = studentColumns.filter((c) => roles[c.key] === "feature");
  const target = studentColumns.find((c) => roles[c.key] === "target");
  const encoded = featureCols.flatMap((c) => encode(c, dropFirst));
  const issues = review(roles);
  const problems = issues.filter((i) => i.level === "problem");
  const ready = problems.length === 0 && target?.key === "passed";

  const unknownFeatures = featureCols.filter((c) => !c.knownAtPrediction);
  const unseenIds = roles.studentId === "feature";

  const yValues = target
    ? students.map((s) => (target.kind === "number" ? Number(s[target.key]) : target.key === "passed" ? (s.passed === "yes" ? 1 : 0) : String(s[target.key])))
    : [];
  const passRate = target?.key === "passed" ? students.filter((s) => s.passed === "yes").length / students.length : null;

  return (
    <div className="@container space-y-6">
      {/* Raw table with a role control above each column */}
      <div className="relative overflow-x-auto rounded-panel border border-line bg-surface" tabIndex={0} role="region" aria-label="Raw student records with a role for each column">
        <table className="w-full min-w-[68rem] border-collapse text-left text-sm">
          <caption className="px-4 pt-3 text-left font-semibold">Raw records at the end of the course, and the role you give each column</caption>
          <thead>
            <tr>
              {studentColumns.map((c) => (
                <th key={c.key} scope="col" className={cx("px-3 pb-2 pt-3 align-bottom", roles[c.key] === "target" && "bg-mist")}>
                  <span className="block whitespace-nowrap font-mono text-[0.8rem] font-normal text-fg">{c.label}</span>
                  <label className="sr-only" htmlFor={`role-${c.key}`}>
                    Role of {c.label}
                  </label>
                  <select
                    id={`role-${c.key}`}
                    value={roles[c.key]}
                    onChange={(e) => setRole(c.key, e.target.value as Role)}
                    className="mt-1.5 w-full min-w-[7rem] rounded-control border border-line-strong bg-page px-2 py-1 text-sm font-normal text-fg"
                  >
                    <option value="feature">Feature</option>
                    <option value="target">Target</option>
                    <option value="unused">Not used</option>
                  </select>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {students.map((s) => (
              <tr key={String(s.studentId)} className="border-t border-line">
                {studentColumns.map((c) => (
                  <td
                    key={c.key}
                    className={cx(
                      "px-3 py-1.5",
                      roles[c.key] === "unused" && "text-fg-faint line-through decoration-line-strong",
                      roles[c.key] === "target" && "bg-mist font-semibold text-fg",
                    )}
                  >
                    {String(s[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 @4xl:grid-cols-2">
        {/* Review */}
        <div className="min-w-0 space-y-3 rounded-panel border border-line bg-surface p-5">
          <p className="font-semibold">Review of your choices</p>
          {issues.length === 0 ? (
            <p className="flex gap-2 text-success">
              <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0" />
              <span>
                The target is <code className="code-inline">passed</code> and every feature is something you would know in week 8. This
                dataset is ready for a model.
              </span>
            </p>
          ) : (
            <ul className="space-y-2" aria-live="polite">
              {issues.map((i) => (
                <li key={i.text} className="flex gap-2">
                  {i.level === "problem" ? (
                    <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-highlight-text" />
                  ) : (
                    <CircleHelp aria-hidden className="mt-0.5 size-5 shrink-0 text-link" />
                  )}
                  <span className="text-fg-muted">
                    <span className="sr-only">{i.level === "problem" ? "Problem: " : "Note: "}</span>
                    {i.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-control border border-line bg-line text-sm">
            <div className="bg-surface px-3 py-2">
              <dt className="text-fg-muted">Problem type</dt>
              <dd className="font-semibold">{!target ? "—" : target.kind === "number" ? "Regression" : "Classification"}</dd>
            </div>
            <div className="bg-surface px-3 py-2">
              <dt className="text-fg-muted">Shape of X</dt>
              <dd className="font-mono">
                ({students.length}, {encoded.length})
              </dd>
            </div>
            <div className="bg-surface px-3 py-2">
              <dt className="text-fg-muted">Shape of y</dt>
              <dd className="font-mono">{target ? `(${students.length},)` : "—"}</dd>
            </div>
            <div className="bg-surface px-3 py-2">
              <dt className="text-fg-muted">Label balance</dt>
              <dd>{passRate !== null ? `${Math.round(passRate * 100)}% passed, ${Math.round((1 - passRate) * 100)}% failed` : "—"}</dd>
            </div>
          </dl>
          <label htmlFor={dropId} className="flex cursor-pointer items-start gap-3 pt-1 text-sm">
            <input
              id={dropId}
              type="checkbox"
              checked={dropFirst}
              onChange={(e) => setDropFirst(e.target.checked)}
              className="mt-0.5 size-4 accent-[var(--color-primary)]"
            />
            <span>
              <span className="font-semibold">Drop the first category of each one-hot column</span>
              <span className="block text-fg-muted">
                With k categories, k − 1 columns carry the same information. Some linear models need this; most others don’t mind.
              </span>
            </span>
          </label>
          <button type="button" onClick={() => { setRoles(initialRoles); setDropFirst(false); }} className={buttonStyles("secondary", "px-3 py-2 text-sm")}>
            <RotateCcw aria-hidden className="size-4" />
            Reset roles
          </button>
        </div>

        {/* New student */}
        <div className="min-w-0 space-y-3 rounded-panel border border-line bg-surface p-5">
          <p className="font-semibold">Inference: a new student in week 8</p>
          <p className="text-sm text-fg-muted">
            S11 is halfway through the course. To predict for them, the model needs the same columns, encoded the same way.
          </p>
          {encoded.length === 0 ? (
            <p className="text-fg-muted">Choose at least one feature to build this row.</p>
          ) : (
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Encoded row for the new student">
              <table className="w-full min-w-max border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {encoded.map((e) => (
                      <th key={e.name} scope="col" className="whitespace-nowrap px-2 py-1 font-mono text-[0.75rem] font-normal text-fg-muted">
                        {e.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-mono">
                    {encoded.map((e) => {
                      const v = e.value(newStudent);
                      return (
                        <td key={e.name} className={cx("px-2 py-1", v === null && "font-semibold text-danger")}>
                          {v === null ? "?" : v}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {unknownFeatures.length > 0 ? (
            <p role="status" className="flex gap-2 rounded-control bg-sunken p-3 text-sm">
              <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
              <span>
                <strong className="font-semibold">No prediction possible.</strong>{" "}
                {unknownFeatures.map((c) => c.label).join(" and ")} {unknownFeatures.length > 1 ? "don’t" : "doesn’t"} exist yet in week 8.
                A model trained with {unknownFeatures.length > 1 ? "these columns" : "this column"} would look excellent in testing and
                be useless in practice.
              </span>
            </p>
          ) : null}
          {unseenIds ? (
            <p className="flex gap-2 rounded-control bg-sunken p-3 text-sm">
              <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-highlight-text" />
              <span>
                S11’s ID was never seen in training, so every <code className="code-inline">student_id_…</code> column is 0. Those{" "}
                {categoriesOf("studentId").length - (dropFirst ? 1 : 0)} columns tell the model nothing about a new student.
              </span>
            </p>
          ) : null}
          {ready ? (
            <p role="status" className="flex gap-2 text-sm text-success">
              <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
              This row is complete: every value exists in week 8, so a trained model could predict for S11.
            </p>
          ) : null}
        </div>
      </div>

      {/* Encoded feature matrix */}
      <details className="rounded-panel border border-line bg-surface" open>
        <summary className="cursor-pointer px-4 py-3 font-semibold sm:px-5">
          The feature matrix X and target y your choices produce
        </summary>
        {encoded.length === 0 ? (
          <p className="border-t border-line px-5 py-4 text-fg-muted">No feature columns yet.</p>
        ) : (
          <div className="overflow-x-auto border-t border-line" tabIndex={0} role="region" aria-label="Feature matrix and target">
            <table className="w-full min-w-max border-collapse text-left text-sm">
              <thead className="bg-sunken">
                <tr>
                  {encoded.map((e) => (
                    <th key={e.name} scope="col" className="whitespace-nowrap px-2.5 py-2 font-mono text-[0.75rem] font-normal">
                      {e.name}
                    </th>
                  ))}
                  {target ? (
                    <th scope="col" className="whitespace-nowrap border-l-2 border-primary bg-mist px-2.5 py-2 font-mono text-[0.75rem] font-semibold">
                      y = {target.label.split(" ")[0]}
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {students.map((s, r) => (
                  <tr key={String(s.studentId)} className="border-t border-line">
                    {encoded.map((e) => (
                      <td key={e.name} className="px-2.5 py-1">
                        {e.value(s)}
                      </td>
                    ))}
                    {target ? <td className="border-l-2 border-primary bg-mist px-2.5 py-1 font-semibold">{String(yValues[r])}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>

      <p className="text-sm text-fg-faint">
        The encoding is computed in your browser from the records above. The students are invented for teaching; a student passes when
        midterm + final exam ≥ 40.
      </p>
    </div>
  );
}
