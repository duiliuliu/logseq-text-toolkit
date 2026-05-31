/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Tooltip 组件 - 基于 radix-ui/react-tooltip，采用 shadcn 风格
 */

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

export const TooltipProvider = TooltipPrimitive.Provider

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  delayDuration?: number
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

export const Tooltip = ({
  children,
  content,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  delayDuration = 200,
  defaultOpen,
  open,
  onOpenChange,
  disabled = false,
}: TooltipProps) => {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <TooltipPrimitive.Root
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
    >
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          className="ltt-tooltip"
          collisionPadding={8}
        >
          {content}
          <TooltipPrimitive.Arrow className="ltt-tooltip-arrow" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export default Tooltip
