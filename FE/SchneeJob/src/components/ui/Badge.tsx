import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
        {
          "bg-brand/10 text-brand hover:bg-brand/20": variant === "default",
          "bg-gray-100 text-gray-800 hover:bg-gray-200": variant === "secondary",
          "bg-red-100 text-red-800 hover:bg-red-200": variant === "destructive",
          "bg-emerald-100 text-emerald-800 hover:bg-emerald-200": variant === "success",
          "bg-yellow-100 text-yellow-800 hover:bg-yellow-200": variant === "warning",
          "border border-gray-200 text-gray-950 bg-white": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
