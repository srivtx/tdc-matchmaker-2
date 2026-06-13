"use client";

import { useEffect } from "react";
import { sounds } from "@/lib/sound";

export default function SoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
      const clickable = target.tagName === "BUTTON" || target.closest("button") || target.tagName === "A" || target.closest("a");
      if (clickable) sounds.click();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return <>{children}</>;
}
