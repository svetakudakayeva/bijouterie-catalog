import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bijouterie Catalog",
  description: "Учебный проект: каталог бижутерии на Next.js + PostgreSQL",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <header className="border-b border-black/10 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Bijouterie<span className="text-gold">.</span>
            </Link>
            <div className="flex items-center gap-5 text-sm">
              <Link href="/products" className="hover:text-gold">
                Каталог
              </Link>
              <Link href="/admin" className="btn-outline">
                Админка
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-10 text-xs text-black/50">
          Учебный проект · Next.js · PostgreSQL · Prisma · CI/CD
        </footer>
      </body>
    </html>
  );
}
