import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary/80 to-primary/40 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-md text-primary-foreground hover:brightness-110",
        destructive: "bg-gradient-to-br from-destructive/80 to-destructive/40 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-md text-destructive-foreground hover:brightness-110",
        outline: "border border-white/10 bg-transparent hover:bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-foreground",
        secondary: "bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-md hover:bg-white/5 text-foreground",
        ghost: "hover:bg-white/5 hover:text-foreground text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "liquid-glass !rounded-md hover:bg-white/5",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        xs: "h-7 px-2 text-[10px] rounded-sm",
        lg: "h-11 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
