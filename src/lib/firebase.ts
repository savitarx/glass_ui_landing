import type { Auth } from "firebase/auth";

/**
 * Firebase bootstrap — loaded LAZILY.
 *
 * The SDK is ~35KB gzipped and nothing on first paint needs it, so it is pulled
 * in with a dynamic import after the page renders. Vite emits it as its own
 * chunk, keeping the initial bundle at its previous size.
 *
 * Config comes from Vite env vars. These are NOT secrets — Firebase web config
 * is public by design; access is controlled by the authorised-domains list and
 * by verifying the ID token server-side (see api/verifyToken.ts).
 *
 * Create `.env.local` from `.env.example`.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** True only when the project has actually been configured. */
export const firebaseReady = Boolean(config.apiKey && config.projectId);

let authPromise: Promise<Auth | null> | null = null;

/**
 * Resolves the Auth instance, initialising Firebase on first call.
 * Resolves to null when Firebase isn't configured — every caller treats that
 * as "auth unavailable" rather than throwing, so a missing .env.local degrades
 * to a clear message instead of a blank page.
 */
export function loadAuth(): Promise<Auth | null> {
  if (!firebaseReady) return Promise.resolve(null);
  if (!authPromise) {
    authPromise = (async () => {
      const [{ initializeApp }, authMod] = await Promise.all([
        import("firebase/app"),
        import("firebase/auth"),
      ]);
      const app = initializeApp(config);
      const auth = authMod.getAuth(app);
      /* Local persistence keeps the session across tabs and restarts. The
         2-day limit is enforced separately in useAuth — Firebase's own session
         would otherwise last indefinitely. */
      await authMod.setPersistence(auth, authMod.browserLocalPersistence);
      return auth;
    })();
  }
  return authPromise;
}

/** Built lazily too — GoogleAuthProvider lives in the same lazy chunk. */
export async function googleProvider() {
  const { GoogleAuthProvider } = await import("firebase/auth");
  const p = new GoogleAuthProvider();
  // always let the user pick which Google account to use
  p.setCustomParameters({ prompt: "select_account" });
  return p;
}
