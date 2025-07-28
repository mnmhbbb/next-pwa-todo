import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Pwa from "@/components/Pwa";
import ReactQueryClientProvider from "@/hooks/useReactQuery";
import GlobalLoadingSpinner from "@/components/GlobalLoadingSpinner";
const sans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "abc",
  description: "웹 푸시 알림 테스트입니다",
  viewport: "initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no",
  icons: {
    icon: [{ url: "/assets/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" }],
    apple: [{ url: "/assets/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "abc",
    description: "웹 푸시 알림 테스트입니다",
    url: "https://next-push-test.vercel.app",
    siteName: "abc",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://next-push-test.vercel.app/assets/icons/og.png",
        width: 1280,
        height: 800,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "abc",
    description: "웹 푸시 알림 테스트입니다",
    images: ["https://next-push-test.vercel.app/assets/icons/og.png"],
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
        <ReactQueryClientProvider>
          <GlobalLoadingSpinner />
          {children}
          <Pwa />
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
