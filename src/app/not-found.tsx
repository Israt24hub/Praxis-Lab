import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";

export default function NotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <p className="text-fg-muted">Error 404</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">This page doesn’t exist.</h1>
      <p className="mt-4 max-w-prose text-lg text-fg-muted">
        The link may be mistyped, or the page may be planned but not built yet. Learning paths and the Project Lab list
        everything that exists so far.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/learn">Browse learning paths</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Go to home
        </ButtonLink>
      </div>
    </Container>
  );
}
