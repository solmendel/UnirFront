"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { useEffect, useRef } from "react";

import { cn } from "./utils";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fixInnerDiv = () => {
      if (viewportRef.current) {
        // Radix UI generates a div with display: table and min-width: 100% as the first child
        const innerDiv = viewportRef.current.firstElementChild as HTMLElement;
        if (innerDiv && innerDiv.tagName === 'DIV') {
          // The key fix: change display from table to block
          // This forces the div to respect the container width instead of using table layout
          innerDiv.style.setProperty('display', 'block', 'important');
          innerDiv.style.setProperty('min-width', '0', 'important');
          innerDiv.style.setProperty('max-width', '100%', 'important');
          innerDiv.style.setProperty('width', '100%', 'important');
          innerDiv.style.setProperty('box-sizing', 'border-box', 'important');
          innerDiv.style.setProperty('overflow', 'hidden', 'important');
          
          // Also ensure the viewport itself has proper overflow control
          if (viewportRef.current) {
            viewportRef.current.style.setProperty('overflow-x', 'hidden', 'important');
            viewportRef.current.style.setProperty('overflow-y', 'auto', 'important');
          }
        }
      }
    };

    // Apply fix immediately
    fixInnerDiv();

    // Use MutationObserver to watch for when Radix UI recreates or modifies the div
    if (viewportRef.current) {
      const observer = new MutationObserver(() => {
        fixInnerDiv();
      });

      observer.observe(viewportRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });

      return () => observer.disconnect();
    }
  }, [children]);

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1 overflow-x-hidden [&>div]:!min-w-0 [&>div]:!max-w-full [&>div]:!w-full [&>div]:!box-border"
        style={{ minWidth: 0, maxWidth: '100%', width: '100%' }}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
