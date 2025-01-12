import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

type AuthState = {
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  resetPassword: (email: string) => Promise<void>;
  verifyOTP: (otp: string, email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: false,
  error: null,
  setError: (error) => set({ error }),
  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/password-reset'
      });
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  verifyOTP: async (otp, email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      if (error) throw error;
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  updatePassword: async (newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));