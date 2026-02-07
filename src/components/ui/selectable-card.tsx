import * as React from "react"

import { cn } from "@/lib/utils"

type SelectionRole = "button" | "radio"

export interface SelectableCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  selected?: boolean
  selectionRole?: SelectionRole
}

export const SelectableCard = React.forwardRef<HTMLButtonElement, SelectableCardProps>(
  (
    {
      className,
      selected = false,
      selectionRole = "button",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const role = selectionRole === "radio" ? "radio" : "button"

    return (
      <button
        type="button"
        ref={ref}
        role={role}
        aria-checked={selectionRole === "radio" ? selected : undefined}
        aria-pressed={selectionRole === "button" ? selected : undefined}
        disabled={disabled}
        className={cn(
          "relative w-full text-left rounded-lg border transition-colors",
          "focus-ring",
          "active:bg-accent",
          "disabled:opacity-50 disabled:pointer-events-none",
          selected
            ? "border-ring bg-accent"
            : "border-border hover:border-ring hover:bg-accent",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

SelectableCard.displayName = "SelectableCard"
