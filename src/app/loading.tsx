import { Container } from "@/components/ui/layout";

/** Shown while a route's content is loading. Mirrors the page-header layout to avoid a jump. */
export default function Loading() {
  return (
    <Container className="py-16">
      <div role="status" aria-live="polite" className="animate-pulse motion-reduce:animate-none">
        <span className="sr-only">Loading page…</span>
        <div className="h-12 w-2/3 max-w-xl rounded-control bg-board-raised" />
        <div className="mt-6 h-5 w-full max-w-prose rounded bg-board-raised" />
        <div className="mt-3 h-5 w-5/6 max-w-prose rounded bg-board-raised" />
        <div className="mt-12 h-64 w-full rounded-panel bg-board-raised" />
      </div>
    </Container>
  );
}
