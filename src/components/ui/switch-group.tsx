// src/components/ui/switch-group.tsx

import React from 'react';
import { Switch, SwitchProps } from './switch';

interface SwitchGroupProps extends Omit<SwitchProps, 'id'> {
  id?: string;
  label?: string;
  description?: string;
  error?: string;
  labelPlacement?: 'left' | 'right';
}

export const SwitchGroup = React.forwardRef<HTMLDivElement, SwitchGroupProps>(
  ({
    id,
    label,
    description,
    error,
    labelPlacement = 'right',
    className = '',
    ...switchProps
  }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).slice(2)}`;

    return (
      <div ref={ref} className={`flex flex-col gap-1.5 ${className}`}>
        <div className={`flex items-center gap-3 ${
          labelPlacement === 'left' ? 'flex-row-reverse justify-end' : 'flex-row'
        }`}>
          {label && (
            <label
              htmlFor={switchId}
              className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              {label}
            </label>
          )}
          <Switch id={switchId} {...switchProps} />
        </div>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

SwitchGroup.displayName = 'SwitchGroup';

// Example usage:
/*
// Basic usage with label
<SwitchGroup
  label="Enable notifications"
  checked={enabled}
  onCheckedChange={setEnabled}
/>

// With description and error
<SwitchGroup
  label="Enable feature"
  description="This will enable the experimental feature for all users"
  error={error}
  checked={enabled}
  onCheckedChange={setEnabled}
/>

// With left-aligned label
<SwitchGroup
  label="Dark mode"
  labelPlacement="left"
  checked={darkMode}
  onCheckedChange={setDarkMode}
/>
*/