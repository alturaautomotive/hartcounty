import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hart County Animal Rescue",
  description:
    "Find your forever friend at Hart County Animal Rescue Society. Browse adoptable pets, schedule visits, and support our mission.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
