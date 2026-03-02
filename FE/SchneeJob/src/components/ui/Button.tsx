import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-brand text-white hover:bg-brand-hover shadow-sm hover:shadow": variant === "default",
            "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow": variant === "destructive",
            "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 shadow-sm": variant === "outline",
            "bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
            "hover:bg-gray-100 hover:text-gray-900": variant === "ghost",
            "text-brand underline-offset-4 hover:underline": variant === "link",
            "h-10 px-5 py-2": size === "default",
            "h-9 px-4": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
