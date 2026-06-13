import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import SoundProvider from "@/components/SoundProvider";

export const metadata: Metadata = {
  title: "TDC Matchmaker — Triage",
  description: "Internal matchmaking dashboard for The Date Crew. Editorial brief, AI insights, mobile-friendly.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  themeColor: [
    { media: "(prefers-color: light)", color: "#FAF8F3" },
    { media: "(prefers-color: dark)", color: "#14110A" },
  ],
  openGraph: {
    title: "TDC Matchmaker",
    description: "The matchmaker workspace. Built for the decision, not the profile.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <SoundProvider>{children}</SoundProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
