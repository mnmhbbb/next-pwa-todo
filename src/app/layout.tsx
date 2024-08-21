import type { Metadata } from "next";
import "./globals.css";

import { Open_Sans } from "next/font/google";
import Pwa from "@/components/Pwa";
import Link from "next/link";
const sans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "abc",
  description: "그래도 해야지 어떡해",
  viewport: "initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no",
  icons: {
    icon: [{ url: "/assets/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" }],
    apple: [
      { url: "/assets/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icons/icon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/assets/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/assets/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "abc",
    description: "그래도 해야지 어떡해",
    url: "https://next-pwa-todo.vercel.app",
    siteName: "abc",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://next-pwa-todo.vercel.app/assets/icons/og.png",
        width: 1280,
        height: 800,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "abc",
    description: "그래도 해야지 어떡해",
    images: ["https://next-pwa-todo.vercel.app/assets/icons/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko_KR">
      <body className={sans.className}>
        <div>
          {/* TODO: Header */}
          <Link className="flex justify-center py-5" href="/">
            Home
          </Link>
          {children}
          <Pwa />
        </div>
      </body>
    </html>
  );
}
