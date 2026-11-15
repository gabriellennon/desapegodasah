"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TrackingCode({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle")

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setStatus("copied")
    } catch {
      setStatus("error")
    }
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <span className="min-w-0 font-medium wrap-anywhere">{code}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="rounded-sm"
          aria-label="Copiar código de rastreio"
          title={
            status === "copied" ? "Código copiado" : "Copiar código de rastreio"
          }
          onClick={copyCode}
        >
          {status === "copied" ? (
            <Check aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
        </Button>
      </div>
      <span
        role="status"
        className={
          status === "error" ? "block text-muted-foreground" : "sr-only"
        }
      >
        {status === "copied" && "Código copiado."}
        {status === "error" && "Selecione o código para copiá-lo."}
      </span>
    </>
  )
}
