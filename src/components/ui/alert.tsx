// src/components/ui/alert.tsx
import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  type = 'info', 
  children, 
  className = '' 
}) => {
  const icons = {
    error: XCircle,
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info
  };

  const styles = {
    error: 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    success: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
  };

  const Icon = icons[type];

  return (
    <div className={`rounded-lg p-4 flex items-start ${styles[type]} ${className}`}>
      <Icon className="h-5 w-5 mt-0.5 mr-3" />
      <div className="text-sm">{children}</div>
    </div>
  );
};