import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import SoundProvider from "@/components/SoundProvider";

export const metadata: Metadata = {
  title: "TDC Matchmaker — Triage",
  description: "Internal matchmaking dashboard for The Date Crew.",
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
