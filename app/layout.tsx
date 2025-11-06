import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoho Sign + Zoho Creator (Deluge) Integration Guide",
  description: "Step-by-step instructions and Deluge code examples to integrate Zoho Sign with Zoho Creator.",
  metadataBase: new URL("https://agentic-96a3b3b1.vercel.app")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          {children}
        </main>
        <footer className="footer">
          <span>? {new Date().getFullYear()} Zoho Sign ? Creator Guide</span>
        </footer>
      </body>
    </html>
  );
}
