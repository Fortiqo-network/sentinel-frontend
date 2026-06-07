"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Root select provider. */
export const Select = SelectPrimitive.Root;

/** Select value display area. */
export const SelectValue = SelectPrimitive.Value;

/**
 * Select trigger button. Renders the current value and a chevron icon.
 */
export function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.SelectTriggerProps & { className?: string }): React.JSX.Element {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2",
        "text-sm text-slate-900 placeholder:text-slate-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors hover:border-slate-300",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/** Dropdown content panel. */
export function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: SelectPrimitive.SelectContentProps & { className?: string }): React.JSX.Element {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md",
          "animate-fade-in",
          position === "popper" && "translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

/** Individual select item. */
export function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.SelectItemProps & { className?: string }): React.JSX.Element {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm",
        "text-slate-700 outline-none",
        "focus:bg-indigo-50 focus:text-indigo-700",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-indigo-500" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/** Label within the select dropdown. */
export function SelectLabel({ className, ...props }: SelectPrimitive.SelectLabelProps & { className?: string }): React.JSX.Element {
  return (
    <SelectPrimitive.Label
      className={cn("py-1.5 pl-8 pr-2 text-xs font-semibold text-slate-400 uppercase tracking-wide", className)}
      {...props}
    />
  );
}

/** Separator within the select dropdown. */
export function SelectSeparator({ className, ...props }: SelectPrimitive.SelectSeparatorProps & { className?: string }): React.JSX.Element {
  return (
    <SelectPrimitive.Separator
      className={cn("my-1 h-px bg-slate-100", className)}
      {...props}
    />
  );
}
