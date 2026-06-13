"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="font-serif"
        style={{ fontSize: 72, color: "var(--ember)", lineHeight: 1, letterSpacing: "-0.03em" }}
      >
        !
      </div>
      <h1
        className="font-serif mt-4 mb-2 text-[color:var(--ink)]"
        style={{ fontSize: 32, letterSpacing: "-0.02em" }}
      >
        Something went wrong.
      </h1>
      <p className="text-[13px] text-[color:var(--ink-muted)] max-w-md mb-6">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-md text-[12px] font-medium text-white"
          style={{ background: "var(--ember)" }}
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-md text-[12px] font-medium"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--ink-soft)",
            border: "1px solid var(--border-strong)",
          }}
        >
          Back to workspace
        </Link>
      </div>
    </div>
  );
}
