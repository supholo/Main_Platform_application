import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
  return (
    <Loader2 className={`animate-spin ${className || 'h-6 w-6'}`} />
  );
};

export default LoadingSpinner;