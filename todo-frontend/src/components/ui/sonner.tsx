// src/components/ui/sonner.tsx
import * as React from "react"
import { Toaster as Sonner } from "sonner"
import type { ToasterProps } from "sonner"     // ← 型は type-only import に

import { useTheme } from "next-themes"

const Toaster = (props: ToasterProps) => {
  // next-themes が返す値: 'light' | 'dark' | 'system' など
  const { theme: rawTheme = "system" } = useTheme()
  const theme = (rawTheme === "light" || rawTheme === "dark") ? rawTheme : "system"

  return (
    <Sonner
      theme={theme}                              // ← 型での無理なキャスト不要
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
