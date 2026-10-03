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
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);