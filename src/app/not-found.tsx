import Link from "next/link";
import { tr } from "@/messages/tr";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{tr.notFound.title}</h1>
      <p className="mt-3 text-muted">{tr.notFound.body}</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition hover:opacity-90"
      >
        {tr.notFound.home}
      </Link>
    </div>
  );
}
