import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Auth Store
 *
 * Stores the authenticated user's profile data + token expiry metadata using
 * zustand with the persist middleware so it survives page refreshes (localStorage).
 *
 * Token expiry is stored as a Unix timestamp (ms). When it is within the
 * REFRESH_BUFFER_MS window the app proactively refreshes in the background.
 */
/**
 * Auth Store
 *
 * Stores the authenticated user's profile data + token expiry metadata using
 * zustand with the persist middleware so it survives page refreshes (localStorage).
 *
 * Token expiry is stored as a Unix timestamp (ms). When it is within the
 * REFRESH_BUFFER_MS window the app proactively refreshes in the background.
 *
 * NOTE on hydration: `persist` rehydrates from localStorage asynchronously on
 * page load. Until rehydration finishes, `user`/`isAuthenticated` hold their
 * initial (logged-out) values. Guards MUST wait for `_hasHydrated` before
 * redirecting, otherwise a refresh on e.g. `/members` reads
 * `isAuthenticated === false`, bounces to `/login`, then bounces again to
 * `/dashboard` once the stored session arrives.
 */
export const useAuthStore = create()(
  persist(
    (set) => ({
      /** The authenticated user's profile data (null when logged out). */
      user: null,
      /** Convenience flag derived from the presence of `user`. */
      isAuthenticated: false,
      /**
       * Unix timestamp (ms) when the current access token expires.
       * Null when not authenticated.
       */
      accessTokenExpiry: null,
      /**
       * True once zustand has finished rehydrating from localStorage.
       * Not persisted — always starts false on page load.
       */
      _hasHydrated: false,

      /** Store the user profile after a successful login. */
      setUser: (user, accessTokenExpiry = null) =>
        set({ user, isAuthenticated: true, accessTokenExpiry }),

      /** Remove the user profile (logout). */
      clearUser: () =>
        set({ user: null, isAuthenticated: false, accessTokenExpiry: null }),

      /** Update the access token expiry after a silent refresh. */
      setAccessTokenExpiry: (expiry) => set({ accessTokenExpiry: expiry }),

      /** Partially update the user profile (e.g. after editing account). */
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),

      /** Internal: mark rehydration as complete. */
      setHasHydrated: () => set({ _hasHydrated: true }),
    }),
    {
      name: "auth-storage", // localStorage key
      // Don't persist the hydration flag itself.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessTokenExpiry: state.accessTokenExpiry,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    }
  )
);