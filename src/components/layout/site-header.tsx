import { Suspense } from "react";

import { Logo } from "./logo";
import { SiteNav, StaticNavLinks } from "./site-nav";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page">
      <nav aria-label="Main" className="relative">
        <div className="mx-auto flex h-16 w-full max-w-page items-center justify-between gap-6 px-5 sm:px-8">
          <Logo />
          {/* usePathname can suspend on routes whose params are unknown at build time. */}
          <div className="flex items-center gap-2 lg:gap-4">
            <Suspense fallback={<StaticNavLinks />}>
              <SiteNav />
            </Suspense>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </header>
  );
}
