import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StackGenerate | Terraform Diagrammer & Cloud Architecture",
  description: "Upload Terraform, parse it, and see a clean cloud architecture diagram with auth, FAQs, and roadmap insights.",
  keywords: [
    "Terraform diagram",
    "cloud architecture",
    "IaC visualization",
    "AWS diagram",
    "DevOps tooling",
    "Cognito auth",
  ],
  icons: {
    icon: [
      { url: "/favicon-v2.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-v2.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon-v2.png", type: "image/png", sizes: "64x64" },
      { url: "/favicon-v2.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon-v2.png",
    apple: "/favicon-v2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
