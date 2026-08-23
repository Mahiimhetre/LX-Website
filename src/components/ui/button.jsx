import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform-gpu transform-style-3d select-none",
  {
    variants: {
      variant: {
        default: "primary-glass-button",
        destructive: "bg-destructive text-white font-semibold hover:bg-destructive/90 border border-white/10 active:scale-95",
        outline: "border border-white/12 bg-white/3 backdrop-blur-xl hover:bg-white/6 hover:border-white/24 hover:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.15)] text-foreground active:scale-95",
        secondary: "glass-button",
        ghost: "hover:bg-white/5 hover:text-foreground text-muted-foreground active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass-button",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-8 rounded-full px-4 text-xs",
        xs: "h-7 px-3 text-[10px] rounded-full",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-10 w-10 !rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
