import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import use3DTilt from "@/hooks/use3DTilt";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform-gpu transform-style-3d select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white font-semibold shadow-glow hover:bg-primary/90 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]",
        destructive: "bg-destructive text-white font-semibold hover:bg-destructive/90 border border-white/10",
        outline: "border border-white/10 bg-transparent hover:bg-white/5 hover:border-white/20 text-foreground",
        secondary: "bg-secondary/50 border border-white/5 hover:border-white/20 hover:bg-secondary text-foreground",
        ghost: "hover:bg-white/5 hover:text-foreground text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "liquid-glass hover:bg-white/5",
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
  ({ className, variant, size, asChild = false, enable3D = true, children, ...props }, forwardedRef) => {
    const Comp = asChild ? Slot : "button";
    
    // Disable 3D for link or ghost variants to prevent text skewing on minimal items
    const is3DDisabled = !enable3D || variant === "link" || variant === "ghost";
    
    const tiltRef = use3DTilt({
      max: size === "sm" || size === "xs" ? 6 : 10,
      scale: size === "sm" || size === "xs" ? 1.015 : 1.03,
      speed: 150,
      disabled: is3DDisabled
    });

    React.useImperativeHandle(forwardedRef, () => tiltRef.current);

    return (
      <Comp
        ref={tiltRef}
        className={cn(buttonVariants({ variant, size, className }))}
        style={{
          transformStyle: is3DDisabled ? undefined : 'preserve-3d',
        }}
        {...props}
      >
        {is3DDisabled ? (
          children
        ) : (
          <span style={{ transform: 'translateZ(10px)', display: 'inline-flex', alignItems: 'center', gap: 'inherit' }}>
            {children}
          </span>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
