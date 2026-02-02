import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Zarisha",
  description: "Zarisha is a minimal, dark UI for browsing anime on AnimePahe",
  icons: {
    icon: '/cursor-sword-thorn.png',
    apple: '/cursor-sword-thorn.png',
  },
  other: {
    "color-scheme": "dark",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background text-text-primary">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 border-b border-divider bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-4">
                  <Image
                    src="/cursor-sword-thorn.png"
                    alt="Zarisha Icon"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  <h1 className="text-app-title font-black tracking-[2px] uppercase">
                    Zarisha
                  </h1>
                  <span className="text-status-label font-semibold tracking-[1.2px] uppercase text-success">
                    beta
                  </span>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                  <Link
                    href="/"
                    className="text-body-secondary hover:text-accent transition-colors"
                  >
                    Search
                  </Link>
                  <Link
                    href="/explore"
                    className="text-body-secondary hover:text-accent transition-colors"
                  >
                    Explore
                  </Link>
                </nav>
              </div>
              <nav className="md:hidden flex items-center gap-6 mt-4 pt-4 border-t border-divider">
                <Link
                  href="/"
                  className="text-body-secondary hover:text-accent transition-colors"
                >
                  Search
                </Link>
                <Link
                  href="/explore"
                  className="text-body-secondary hover:text-accent transition-colors"
                >
                  Explore
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-6 py-8">{children}</main>
          <footer className="border-t border-divider py-6">
            <div className="container mx-auto px-6 text-center text-text-secondary text-body-secondary">
              <p>
                <a
                  href="https://animepahe.si/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  AnimePahe
                </a>{" "}
                Alternative Frontend
              </p>
              <p className="mt-2 font-mono text-xs">
                made by{" "}
                <a
                  href="https://github.com/danial2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  danial
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}