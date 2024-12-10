// src/components/ui/badge.tsx

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline:
          "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        error:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        ghost:
          "hover:bg-accent hover:text-accent-foreground border border-transparent",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      rounded: {
        default: "rounded-full",
        sm: "rounded-md",
        lg: "rounded-lg",
      },
      interactive: {
        true: "cursor-pointer",
        false: "cursor-default",
      },
      removable: {
        true: "pr-1",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      interactive: false,
      removable: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  onRemove?: () => void;
  count?: number;
  dot?: boolean;
  pulse?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    interactive,
    removable,
    icon,
    onRemove,
    count,
    dot,
    pulse,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ 
            variant, 
            size, 
            rounded, 
            interactive, 
            removable 
          }),
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "mr-1 h-2 w-2 rounded-full",
              pulse && "animate-pulse",
              variant === 'success' && "bg-green-500",
              variant === 'warning' && "bg-yellow-500",
              variant === 'error' && "bg-red-500",
              variant === 'info' && "bg-blue-500",
              variant === 'default' && "bg-primary",
            )}
          />
        )}
        {icon && <span className="mr-1">{icon}</span>}
        {children}
        {count !== undefined && (
          <span className={cn(
            "ml-1 px-1 py-0.5 text-xs rounded-full",
            variant === 'outline' ? "bg-accent" : "bg-white/20"
          )}>
            {count}
          </span>
        )}
        {removable && onRemove && (
          <button
            onClick={onRemove}
            className={cn(
              "ml-1 rounded-full p-0.5 hover:bg-black/10",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              variant === 'outline' && "focus:ring-accent"
            )}
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };