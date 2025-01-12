import { create } from 'zustand';

type DialogState = {
  isOpen: boolean;
  dialogType: string | null;
  data: any;
  openDialog: (type: string, data?: any) => void;
  closeDialog: () => void;
};

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  dialogType: null,
  data: null,
  openDialog: (type, data = null) => set({ isOpen: true, dialogType: type, data }),
  closeDialog: () => set({ isOpen: false, dialogType: null, data: null }),
}));