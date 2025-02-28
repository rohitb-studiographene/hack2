import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeWrapper } from "@/components/theme-wrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Requirements Processor",
  description: "Process requirements and generate test cases and summaries",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
