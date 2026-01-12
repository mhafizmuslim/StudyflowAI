import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      persona: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Login gagal');
        }
        
        const data = await res.json();
        set({ 
          user: data.user, 
          token: data.token, 
          isAuthenticated: true 
        });
        
        // Fetch persona after login
        try {
          await get().fetchPersona();
        } catch (error) {
          console.error('Failed to fetch persona after login:', error);
        }
        
        return data;
      },
      
      register: async (nama, email, password) => {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama, email, password })
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Registrasi gagal');
        }
        
        const data = await res.json();
        set({ 
          user: data.user, 
          token: data.token, 
          isAuthenticated: true 
        });
        
        return data;
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          persona: null, 
          isAuthenticated: false 
        });
      },
      
      fetchPersona: async () => {
        const token = get().token;
        const res = await fetch(`${API_URL}/onboarding/persona`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          set({ persona: data.persona });
        } else if (res.status === 401) {
          // Token expired, logout
          get().logout();
        }
      },
      
      setPersona: (persona) => {
        set({ persona });
      }
    }),
    {
      name: 'studyflow-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        persona: state.persona
      })
    }
  )
);

