import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PILOT — simulated users before you ship",
  description: "Put your product in front of simulated users before you ship.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
