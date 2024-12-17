// src/components/ui/switch.tsx

import React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'danger';
}

const getSizeClasses = (size: SwitchProps['size']) => {
  switch (size) {
    case 'sm':
      return {
        root: 'h-4 w-8',
        thumb: 'h-3 w-3',
        translation: 'translate-x-4'
      };
    case 'lg':
      return {
        root: 'h-7 w-14',
        thumb: 'h-6 w-6',
        translation: 'translate-x-7'
      };
    default: // md
      return {
        root: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translation: 'translate-x-5'
      };
  }
};

const getColorClasses = (color: SwitchProps['color']) => {
  switch (color) {
    case 'success':
      return 'data-[state=checked]:bg-green-500 dark:data-[state=checked]:bg-green-600';
    case 'danger':
      return 'data-[state=checked]:bg-red-500 dark:data-[state=checked]:bg-red-600';
    default: // primary
      return 'data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600';
  }
};

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className = '', size = 'md', color = 'primary', ...props }, ref) => {
  const sizeClasses = getSizeClasses(size);
  const colorClasses = getColorClasses(color);

  return (
    <SwitchPrimitives.Root
      className={`
        relative inline-flex shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200
        ease-in-out focus:outline-none focus-visible:ring-2
        focus-visible:ring-indigo-500 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        bg-gray-200 dark:bg-gray-700
        ${colorClasses}
        ${sizeClasses.root}
        ${className}
      `}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={`
          pointer-events-none rounded-full bg-white shadow-lg ring-0
          transition-transform duration-200 ease-in-out
          ${sizeClasses.thumb}
          data-[state=checked]:${sizeClasses.translation}
        `}
      />
    </SwitchPrimitives.Root>
  );
});

Switch.displayName = 'Switch';

// Export default props for usage examples
export const switchDefaultProps = {
  checked: false,
  onCheckedChange: (checked: boolean) => {},
  size: 'md' as const,
  color: 'primary' as const,
  disabled: false,
};

// Export switch sizes and colors for type checking
export const switchSizes = ['sm', 'md', 'lg'] as const;
export const switchColors = ['primary', 'success', 'danger'] as const;

// Example usage:
/*
// Basic usage
<Switch checked={isEnabled} onCheckedChange={setIsEnabled} />

// With different sizes
<Switch size="sm" checked={isEnabled} onCheckedChange={setIsEnabled} />
<Switch size="md" checked={isEnabled} onCheckedChange={setIsEnabled} />
<Switch size="lg" checked={isEnabled} onCheckedChange={setIsEnabled} />

// With different colors
<Switch color="primary" checked={isEnabled} onCheckedChange={setIsEnabled} />
<Switch color="success" checked={isEnabled} onCheckedChange={setIsEnabled} />
<Switch color="danger" checked={isEnabled} onCheckedChange={setIsEnabled} />

// Disabled state
<Switch disabled checked={isEnabled} onCheckedChange={setIsEnabled} />
*/