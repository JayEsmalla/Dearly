import type { Metadata } from "next";
import "@fontsource-variable/figtree/wght.css";
import "@fontsource-variable/newsreader/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dearly — Thoughtful digital gifts",
  description:
    "Create thoughtful digital gifts that feel as meaningful to open as they were to make.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
