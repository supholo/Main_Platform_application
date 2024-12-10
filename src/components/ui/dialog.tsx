// src/components/ui/dialog.tsx
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> & {
  Content: React.FC<{ children: React.ReactNode; className?: string }>;
  Header: React.FC<{ children: React.ReactNode; className?: string }>;
  Title: React.FC<{ children: React.ReactNode; className?: string }>;
  Description: React.FC<{ children: React.ReactNode; className?: string }>;
} = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Dialog position */}
        <div className="inline-block w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

Dialog.Content = ({ children, className }) => (
  <div
    className={cn(
      "relative inline-block w-full text-left align-middle transition-all transform",
      "bg-white dark:bg-gray-800 rounded-lg shadow-xl",
      "my-8 max-w-7xl",
      className
    )}
  >
    {children}
  </div>
);

Dialog.Header = ({ children, className }) => (
  <div className={cn(
    "flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700",
    className
  )}>
    <div>{children}</div>
  </div>
);

Dialog.Title = ({ children, className }) => (
  <h3 className={cn(
    "text-xl font-semibold text-gray-900 dark:text-white",
    className
  )}>
    {children}
  </h3>
);

Dialog.Description = ({ children, className }) => (
  <p className={cn(
    "mt-2 text-sm text-gray-500 dark:text-gray-400",
    className
  )}>
    {children}
  </p>
);

export default Dialog;