import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { site } from "@/lib/site";
import { tr } from "@/messages/tr";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: tr.home.lead,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-line">
          <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
            <Link href="/" className="text-[15px] font-semibold tracking-tight">
              {site.name}
              <span className="ml-2 hidden font-normal text-muted sm:inline">{site.tagline}</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-muted">
            <p>{tr.footer.note}</p>
            <p className="mt-1">
              {tr.footer.by}:{" "}
              <a href={site.author.url} className="underline underline-offset-2 hover:text-ink">
                {site.author.name}
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
