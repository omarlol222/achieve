import { useCallback } from 'react';
import { useDialogStore } from '@/store/useDialogStore';

export function useDialog(dialogType: string) {
  const { isOpen, dialogType: currentType, data, openDialog, closeDialog } = useDialogStore();

  const open = useCallback((data?: any) => {
    openDialog(dialogType, data);
  }, [dialogType, openDialog]);

  const close = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const isCurrentDialog = isOpen && currentType === dialogType;

  return {
    isOpen: isCurrentDialog,
    data: isCurrentDialog ? data : null,
    open,
    close,
  };
}