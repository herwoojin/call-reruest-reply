"use client";

import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createGoogleProvider,
  getAuthClient,
  isFirebaseConfigured,
} from "./client";
import type { Role } from "@/lib/status-machine";

type AuthState = {
  user: User | null;
  /** 커스텀 클레임 role — Phase 2에서 Admin SDK로 부여, 미부여 시 null */
  role: Role | null;
  loading: boolean;
  /** false면 .env.local의 Firebase 키 미기입 상태 */
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(getAuthClient(), async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdTokenResult();
        setRole((token.claims.role as Role | undefined) ?? null);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(getAuthClient(), createGoogleProvider());
  };

  const signOut = async () => {
    await fbSignOut(getAuthClient());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        configured: isFirebaseConfigured,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 안에서만 사용하세요");
  return ctx;
}
