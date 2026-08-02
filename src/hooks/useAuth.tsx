import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { loadAuth, firebaseReady, googleProvider } from "../lib/firebase";

/** Sessions expire after this long, then the user must sign in again. */
const SESSION_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const STARTED_AT = "invisos-auth-started";

export type AuthState = {
  user: User | null;
  /** true until the first auth state resolves — avoids a login/profile flicker */
  loading: boolean;
  /** false when Firebase env vars are missing */
  available: boolean;
  error: string;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

/** When did the current session begin? 0 if there isn't one. */
function sessionStart(): number {
  try {
    return Number(localStorage.getItem(STARTED_AT)) || 0;
  } catch {
    return 0;
  }
}

function markSessionStart(reset = false) {
  try {
    if (reset) localStorage.removeItem(STARTED_AT);
    else if (!sessionStart()) localStorage.setItem(STARTED_AT, String(Date.now()));
  } catch {
    /* storage blocked — the session simply won't outlive the tab */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseReady);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;

    void (async () => {
      const auth = await loadAuth();
      if (!auth || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { onAuthStateChanged, signOut: fbSignOut } = await import(
        "firebase/auth"
      );

      unsub = onAuthStateChanged(auth, (u) => {
        if (u) {
          /* 2-DAY EXPIRY. Firebase's own local persistence never expires, so
             the age of the session is tracked separately and enforced here. */
          const started = sessionStart();
          if (started && Date.now() - started > SESSION_MS) {
            void fbSignOut(auth);
            markSessionStart(true);
            setUser(null);
            setLoading(false);
            return;
          }
          markSessionStart(); // first sight of this session — stamp it
          setUser(u);
        } else {
          markSessionStart(true);
          setUser(null);
        }
        setLoading(false);
      });
    })();

    /* Also expire while the tab is open and idle, not only on reload. */
    const tick = window.setInterval(() => {
      const started = sessionStart();
      if (started && Date.now() - started > SESSION_MS) {
        void (async () => {
          const a = await loadAuth();
          if (a) {
            const { signOut } = await import("firebase/auth");
            await signOut(a);
          }
          markSessionStart(true);
        })();
      }
    }, 60_000);

    return () => {
      cancelled = true;
      unsub();
      window.clearInterval(tick);
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      available: firebaseReady,
      error,
      signIn: async () => {
        const auth = await loadAuth();
        if (!auth) {
          setError("Sign-in isn't configured yet. Please email us directly.");
          return false;
        }
        setError("");
        try {
          const { signInWithPopup } = await import("firebase/auth");
          await signInWithPopup(auth, await googleProvider());
          markSessionStart(true); // fresh session → restart the 2-day clock
          markSessionStart();
          return true;
        } catch (e) {
          const code = (e as { code?: string })?.code ?? "";
          // closing the popup is a normal user action, not an error worth showing
          if (
            code === "auth/popup-closed-by-user" ||
            code === "auth/cancelled-popup-request"
          ) {
            return false;
          }
          setError(
            code === "auth/unauthorized-domain"
              ? "This domain isn't authorised in Firebase yet."
              : "Sign-in failed. Please try again."
          );
          return false;
        }
      },
      signOut: async () => {
        const auth = await loadAuth();
        if (auth) {
          const { signOut } = await import("firebase/auth");
          await signOut(auth);
        }
        markSessionStart(true);
      },
    }),
    [user, loading, error]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
