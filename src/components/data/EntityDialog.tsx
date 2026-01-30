import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export type EntityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const sizeToClass: Record<NonNullable<EntityDialogProps['size']>, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

export function EntityDialog(props: EntityDialogProps) {
  const { open, onOpenChange, title, children, footer, size = 'md' } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeToClass[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2">{children}</div>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

export default EntityDialog;


