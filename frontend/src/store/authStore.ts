import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      setAuth: (user, token) => {
        console.log('setAuth called with:', { user, token: token ? 'present' : 'missing' });
        set({ user, token });
        // Verify it was set
        setTimeout(() => {
          const state = get();
          console.log('Auth state after setAuth:', { 
            user: state.user, 
            token: state.token ? 'present' : 'missing',
            isAuth: state.isAuthenticated()
          });
        }, 50);
      },
      
      logout: () => {
        console.log('logout called');
        set({ user: null, token: null });
      },
      
      isAuthenticated: () => {
        const state = get();
        const isAuth = state.token !== null && state.user !== null;
        console.log('isAuthenticated check:', { 
          hasToken: state.token !== null, 
          hasUser: state.user !== null,
          result: isAuth 
        });
        return isAuth;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

