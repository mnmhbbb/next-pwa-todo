import nextPwa from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {};

const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  customWorkerDir: "worker",
  // disable: process.env.NODE_ENV === 'development'
  // runtimeCaching,
});

const config = withPWA({
  ...nextConfig,
});

export default config;
