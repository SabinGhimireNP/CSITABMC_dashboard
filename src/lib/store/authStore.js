import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Auth Store
 *
 * Stores the authenticated user's profile data using zustand with
 * the persist middleware so it survives page refreshes (localStorage).
 *
 * Usage:
 *   import { useAuthStore } from "@/lib/store/authStore";
 *
 *   // Select the whole user object
 *   const user = useAuthStore((state) => state.user);
 *
 *   // Select a single field (recommended for performance)
 *   const email = useAuthStore((state) => state.user?.email);
 *
 *   // Actions
 *   const setUser = useAuthStore((state) => state.setUser);
 *   const clearUser = useAuthStore((state) => state.clearUser);
 *   const updateUser = useAuthStore((state) => state.updateUser);
 */
export const useAuthStore = create()(
  persist(
    (set) => ({
      /** The authenticated user's profile data (null when logged out). */
      user: null,
      /** Convenience flag derived from the presence of `user`. */
      isAuthenticated: false,

      /** Store the user profile after a successful login. */
      setUser: (user) => set({ user, isAuthenticated: true }),

      /** Remove the user profile (logout). */
      clearUser: () => set({ user: null, isAuthenticated: false }),

      /** Partially update the user profile (e.g. after editing account). */
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);