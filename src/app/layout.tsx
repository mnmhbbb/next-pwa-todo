import type { Metadata } from "next";
import "./globals.css";

import { Open_Sans } from "next/font/google";
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
  appleWebApp: {
    title: "abc",
    statusBarStyle: "black-translucent",
    startupImage: [
      "https://next-pwa-todo.vercel.app/assets/icons/icon-192x192.png",
      {
        url: "https://next-pwa-todo.vercel.app/assets/splashscreens/iphone5_splash.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "https://next-pwa-todo.vercel.app/assets/splashscreens/iphone6_splash.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "https://next-pwa-todo.vercel.app/assets/splashscreens/iphoneplus_splash.png",
        media: "(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "https://next-pwa-todo.vercel.app/assets/splashscreens/iphonex_splash.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "https://next-pwa-todo.vercel.app/assets/splashscreens/iphonexr_splash.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "https://next-pwa-todo.vercel.app/assets/splashscreens/iphonexsmax_splash.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "https://next-pwa-todo.vercel.app/assets/splashscreens/ipad_splash.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "https://next-pwa-todo.vercel.app/assets/splashscreens/ipadpro1_splash.png",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "https://next-pwa-todo.vercel.app/assets/splashscreens/ipadpro3_splash.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "https://next-pwa-todo.vercel.app/assets/splashscreens/ipadpro2_splash.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko_KR">
      <body className={sans.className}>{children}</body>
    </html>
  );
}
