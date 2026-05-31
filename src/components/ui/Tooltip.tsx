/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Tooltip 组件 - 基于 radix-ui/react-tooltip，采用 shadcn 风格
 */

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={
      'ltt-tooltip'
    }
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
