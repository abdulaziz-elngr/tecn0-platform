import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-[var(--gold-deep)]">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-[var(--slate)]">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-[var(--gold)] px-6 text-sm font-medium text-[var(--ink)] hover:bg-[var(--gold-deep)]"
      >
        Back to home
      </Link>
    </main>
  );
}
