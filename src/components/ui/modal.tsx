// src/components/ui/modal.tsx

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className={cn(
          "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
          "w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg",
          "focus:outline-none",
          "max-h-[90vh] overflow-y-auto",
          className
        )}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};