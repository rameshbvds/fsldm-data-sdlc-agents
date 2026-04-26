import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "FSLDM · Data SDLC Console",
  description: "AI-orchestrated FSLDM data warehouse migration platform for Tier-1 banks.",
};

// Force dynamic rendering on all pages — avoids serverless pre-render crashes.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Nav />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
