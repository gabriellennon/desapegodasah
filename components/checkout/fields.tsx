import type { ComponentProps } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const fieldClass =
  "mt-2 block h-12 w-full rounded-sm border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"

export function Field({
  label,
  loading = false,
  ...props
}: Omit<ComponentProps<"input">, "className"> & {
  label: string
  loading?: boolean
}) {
  return (
    <div className="relative">
      <label className="block text-sm">
        {label}
        <input className={fieldClass} {...props} />
      </label>
      {loading && (
        <Skeleton
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 left-3 h-4 w-1/3 rounded-sm bg-border"
        />
      )}
    </div>
  )
}

export function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-6 font-heading text-4xl leading-none sm:text-5xl">
      {children}
    </h1>
  )
}
