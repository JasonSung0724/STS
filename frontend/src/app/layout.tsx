import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import "@/styles/globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "STS - AI CEO Platform",
    template: "%s | STS",
  },
  description:
    "Start To Scale - AI-powered business intelligence platform for enterprise decision making",
  keywords: ["AI", "CEO", "Business Intelligence", "KPI", "Analytics"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* OpenAI ChatKit Script */}
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
