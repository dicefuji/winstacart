import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-green-100 text-green-800",
        secondary: "border-transparent bg-gray-100 text-gray-800",
        destructive: "border-transparent bg-red-100 text-red-800",
        outline: "border-gray-200 text-gray-700",
        sale: "border-transparent bg-red-500 text-white",
        organic: "border-transparent bg-emerald-100 text-emerald-800",
        tag: "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
