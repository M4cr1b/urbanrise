import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <Compass className="mb-4 size-10 text-outline" aria-hidden />
      <h1 className="mb-2 font-headline text-headline-lg text-primary">
        Page not found
      </h1>
      <p className="mb-8 text-body-md text-on-surface-variant">
        That address doesn&apos;t exist on UrbanRise. It may have been a listing
        that has since been withdrawn.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/search"
          className="btn-leaf rounded-md bg-primary-container px-5 py-2.5 text-body-md text-on-primary-container hover:bg-primary hover:text-on-primary"
        >
          Search properties
        </Link>
        <Link
          href="/"
          className="rounded-md border border-outline-variant px-5 py-2.5 text-body-md text-on-surface-variant hover:border-primary hover:text-primary"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
