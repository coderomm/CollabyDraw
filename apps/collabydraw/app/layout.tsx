import type { Metadata } from "next";
import { Assistant, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { baseMetadata, jsonLdSchema } from "@/utils/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdSchema)
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${assistant.variable} antialiased flex min-h-screen flex-col bg-background`}
      >
        <Provider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
